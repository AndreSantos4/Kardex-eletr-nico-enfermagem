package pt.ipcb.kardex.kardex_eletronico.service.shift;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.ShiftChangeFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftChangeDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.DetailedShiftChangeDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.PassagemTurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.PendenciaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.atribuicao.AssignNursesDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.util.Pagination;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AtribuicaoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PassagemTurno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.PassagemTurnoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService{

    private final Clock clock;

    private final TurnoRepository repository;
    private final TurnoMapper mapper;
    private final WorkerService workerService;
    private final PatientService patientService;
    private final PassagemTurnoRepository passagemTurnoRepository;
    private final ProcessService processService;

    @Override
    @Transactional
    public void createShift(CreateShiftDTO data) {
        var shift = mapper.fromCreate(data);
        validateShift(data, shift);
        setAlocatedNurses(data, shift);

        repository.save(shift);
    }

    @Override
    @Transactional
    public void editShift(Long shiftId, CreateShiftDTO data) {
        var shift = getValidShift(shiftId);

        if (shift.getInicio().isBefore(LocalDateTime.now(clock))) {
            throw new KardexException("Nao e possivel editar um turno que ja foi iniciado");
        }

        shift.setTipo(data.tipo());

        validateShift(data, shift);
        setAlocatedNurses(data, shift);
    }

    private void setAlocatedNurses(CreateShiftDTO data, Turno shift) {
        shift.getEnfermeiros().forEach(worker -> worker.getTurnos().remove(shift));
        shift.getEnfermeiros().clear();

        var workers = data.IdEnfermeiros()
                .stream()
                .map(id -> {
                    var worker = workerService.getWorker(id);
                    if(worker.getDados().getRole() != Role.ENFERMEIRO){
                        throw new KardexException("So podem ser alocados enfermeiros a um turno");
                    }

                    worker.getTurnos().add(shift);

                    return worker;
                })
                .toList();

        shift.setEnfermeiros(new HashSet<>(workers));
    }

    private void validateShift(CreateShiftDTO data, Turno shift) {
        switch (data.tipo()) {
            case TipoTurno.MANHA:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(8, 0)));
                shift.setFim(LocalDateTime.of(data.data(), LocalTime.of(16, 0)));
                break;
            case TipoTurno.TARDE:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(16, 0)));
                shift.setFim(LocalDateTime.of(data.data().plusDays(1), LocalTime.MIDNIGHT));
                break;
            case TipoTurno.NOITE:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.MIDNIGHT));
                shift.setFim(LocalDateTime.of(data.data(), LocalTime.of(8, 0)));
                break;
        }

        if(repository.existsOverlap(shift.getInicio(), shift.getFim(), shift.getId() == null ? 0l : shift.getId())){
            throw new KardexException("Ja existe um turno neste horario");
        }
    }

    @Override
    @Transactional
    public void deleteShift(Long shiftId) {
        var shift = getValidShift(shiftId);

        if(!shift.getEnfermeiros().isEmpty()){
            throw new KardexException("Nao e possivel eliminar um turno com enfermeiros alocados");
        }

        repository.delete(shift);
    }

    @Override
    @Transactional
    public void assignNurses(Long shiftId, AssignNursesDTO data) {
        var shift = getValidShift(shiftId);
        var newAssignments = new ArrayList<AtribuicaoUtente>();

        data.atribuicoes().forEach(a -> {
            var patient = patientService.getValidPatient(a.idUtente());
            var worker = workerService.getWorker(a.idEnfermeiro());

            if (worker.getDados().getRole() != Role.ENFERMEIRO) {
                throw new KardexException("O funcionario associado nao e um enfermeiro");
            }
            if (!shift.getEnfermeiros().contains(worker)) {
                throw new KardexException("Nao pode ser designado um funcionario que nao foi alocado ao turno");
            }
            if (shift.getAtribuicoes()
                    .stream()
                    .anyMatch(a2 -> a2.getEnfermeiro().equals(worker) && a2.getUtente().equals(patient))) {
                throw new ConflictEntitiesException("Desiganacoes duplicadas");
            }

            var assignment = new AtribuicaoUtente(null, worker, patient, shift);
            shift.getAtribuicoes().add(assignment);
            newAssignments.add(assignment);
        });

        processService.buildPendingIssues(shift, newAssignments);
    }

    private Turno getValidShift(Long shiftId){
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        if(shift.getFim().isBefore(LocalDateTime.now(clock))){
            throw new KardexException("Nao e possivel alterar um turno passado");
        }

        return shift;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoDTO> getAllShifts() {
        var shifts = repository.findAll();
        return mapper.toDTOList(shifts);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PassagemTurnoDTO getShiftChange(Long shiftId) {
        var shift = repository.findPreviousShift(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        if(shift.getFim().isAfter(LocalDateTime.now(clock))){
            throw new KardexException("O turno nao e valido para ser alterado ainda.");
        }

        PassagemTurno shiftChange;
        if (shift.getPassagemTurno() != null) {
            shiftChange = shift.getPassagemTurno();
        } else {
            var nextShift = repository.findFirstByFimAfterOrderByInicioAsc(LocalDateTime.now(clock))
                    .orElseThrow(() -> new KardexException("Nao existe nenhum turno agendado"));
            shiftChange = new PassagemTurno();
            shiftChange.setTurno(shift);
            shiftChange.setProximoTurno(nextShift);
            shift.setPassagemTurno(shiftChange);

            processService.buildPendingIssues(shift, shift.getAtribuicoes().stream().toList());
        }

        return new PassagemTurnoDTO(
                shiftChange.getId(),
                mapper.toLimitedDTO(shift),
                mapper.toLimitedDTO(shiftChange.getProximoTurno()),
                mapper.toIssuesDTOList(shift.getPendencias())
        );
    }

    @Override
    @Transactional
    public void executeShiftChange(Long shiftId, CreateShiftChangeDTO data) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        var shiftChange = shift.getPassagemTurno();
        if(shiftChange == null){
            throw new KardexException("Nao existe passagem de turno para o turno");
        }

        if(!shiftChange.isAtivo()){
            throw new KardexException("A passagem de turno ja foi validada");
        }

        shiftChange.setAtivo(false);
        shiftChange.setObservacoes(data.observacoes());
    }

    @Override
    @Transactional
    public TurnoDTO getShift(Long shiftId) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        return mapper.toDTO(shift);
    }

    @Transactional
    @Override
    public List<PendenciaDTO> getPendingIssues(Long shiftId) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        processService.buildPendingIssues(shift, shift.getAtribuicoes().stream().toList());

        return mapper.toIssuesDTOList(shift.getPendencias());
    }

    @Override
    @Transactional
    public void validateShiftChange(Long shiftId, CreateShiftChangeDTO data) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));
        var worker = workerService.getAutenticatedWorker();

        var shiftChange = shift.getPassagemTurno();
        if(shiftChange == null){
            throw new KardexException("Nao existe passagem de turno para o turno");
        }

        if(shiftChange.isAtivo()){
            throw new KardexException("A passagem de turno nao pode ser validade");
        }

        shiftChange.setPendente(false);
        shiftChange.setObservacoesValidacao(data.observacoes());
        shiftChange.setValidador(worker);
        shiftChange.setDataValidacao(LocalDateTime.now(clock));
    }

    @Override
    @Transactional
    public void sendBackShiftChange(Long shiftId) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        var shiftChange = shift.getPassagemTurno();
        if(shiftChange == null){
            throw new KardexException("Nao existe passagem de turno para o turno");
        }

        if(shiftChange.isAtivo()){
            throw new KardexException("A passagem de turno nao pode ser validade");
        }

        shiftChange.setAtivo(true);
        shiftChange.setPendente(false);
        shiftChange.setObservacoes(null);
        shiftChange.setObservacoesValidacao(null);
        shiftChange.setValidador(null);
        shiftChange.setDataValidacao(null);
    }

    @Transactional(readOnly = true)
    @Override
    public TurnoDTO getPendingShift() {
        var worker = workerService.getAutenticatedWorker();
        var shift = repository.findFirstByPassagemTurnoPendenteTrueAndEnfermeiros_IdOrderByInicioDesc(worker.getId()).orElse(null);

        return mapper.toDTO(shift);
    }

    @Transactional(readOnly = true)
    @Override
    public TurnoDTO getCurrentShift(){
        var shift = repository.findCurrentShift(LocalDateTime.now(clock))
            .orElse(null);
        return mapper.toDTO(shift);
    }

    @Transactional(readOnly = true)
    @Override
    public List<PassagemTurnoDTO> getShiftHistory(Pagination pagination, ShiftChangeFilter filter) {
        var passagens = passagemTurnoRepository.findAll(filter.toSpecification(), pagination.toPageable());
        return passagens.stream().map(p -> new PassagemTurnoDTO(
                p.getId(),
                mapper.toLimitedDTO(p.getTurno()),
                mapper.toLimitedDTO(p.getProximoTurno()),
                mapper.toIssuesDTOList(p.getTurno().getPendencias())
        )).toList();
    }

	@Override
	public DetailedShiftChangeDTO getDetailedShiftChange(Long changeId) {
		var change = passagemTurnoRepository.findById(changeId)
		        .orElseThrow(() -> EntityNotFoundException.forId(changeId, "Passagem de Turno"));

		return mapper.toDetailsChangeDTO(change, change.turno.getPendencias());
	}
}
