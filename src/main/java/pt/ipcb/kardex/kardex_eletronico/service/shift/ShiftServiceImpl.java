package pt.ipcb.kardex.kardex_eletronico.service.shift;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtentePassagemTurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.AdministracoesDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.*;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AtribuicaoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PassagemTurno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.AdministracaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.IncidenteMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.UtenteMapper;
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
    private final ProcessService processService;
    private final AdministracaoMapper administracaoMapper;
    private final UtenteMapper utenteMapper;
    private final IncidenteMapper incidenteMapper;

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
                    if(!workerService.isAvailable(worker, shift.inicio, shift.fim)){
                        throw new ConflictEntitiesException("Funcionario de id " + worker.getId() + " com turnos sobrepostos");
                    }

                    worker.getTurnos().add(shift);

                    return worker;
                })
                .toList();

        shift.setEnfermeiros(new HashSet<>(workers));
    }

    private void validateShift(CreateShiftDTO data, Turno shift) {
        switch (data.tipo()) {
            case TipoTurno.CUSTOM:
                if (data.horaInicio() == null || data.horaFim() == null) {
                    throw new KardexException(
                            "Para turnos com horario personalizado, e necessario especificar a hora de inicio e de fim"
                    );
                }
                shift.setInicio(LocalDateTime.of(data.data(), data.horaInicio()));
                if (data.horaInicio().isAfter(data.horaFim())) {
                    shift.setFim(LocalDateTime.of(data.data().plusDays(1), data.horaFim()));
                } else if (data.horaInicio().equals(data.horaFim())){
                    throw new KardexException("Hora de fim e inicio nao podem ser iguais");
                } else {
                    shift.setFim(LocalDateTime.of(data.data(), data.horaFim()));
                }
                break;
            case TipoTurno.MANHA:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(8, 0)));
                shift.setFim(LocalDateTime.of(data.data(), LocalTime.of(16, 0)));
                break;
            case TipoTurno.TARDE:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(16, 0)));
                shift.setFim(LocalDateTime.of(data.data().plusDays(1), LocalTime.of(0, 0)));
                break;
            case TipoTurno.NOITE:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(0, 0)));
                shift.setFim(LocalDateTime.of(data.data(), LocalTime.of(8, 0)));
                break;
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

        data.atribuicoes().forEach(a -> {
            var patient = patientService.getValidPatient(a.idUtente());
            var worker = workerService.getWorker(a.idEnfermeiro());

            if(worker.getDados().getRole() != Role.ENFERMEIRO){
                throw new KardexException("O funcionario associado nao e um enfermeiro");
            }

            if(!shift.getEnfermeiros().contains(worker)){
                throw new KardexException("Nao pode ser designado um funcionario que nao foi alocado ao turno");
            }

            if(shift.getAtribuicoes()
                    .stream()
                    .anyMatch(a2 -> a2.getEnfermeiro().equals(worker) && a2.getUtente().equals(patient))){
                throw new ConflictEntitiesException("Desiganacoes duplicadas");
            }

            var assignment = new AtribuicaoUtente(null, worker, patient, shift);
            shift.getAtribuicoes().add(assignment);
        });
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
    public List<TurnoDTO> getAllShifts() {
        var shifts = repository.findAll();
        return mapper.toDTOList(shifts);
    }

    @Override
    @Transactional
    public PassagemTurnoDTO getShiftChange(Long shiftId) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        if(shift.getFim().isAfter(LocalDateTime.now(clock))){
            throw new KardexException("O turno nao e valido para ser alterado ainda.");
        }

        PassagemTurno shiftChange;
        if (shift.getPassagemTurno() != null) {
            shiftChange = shift.getPassagemTurno();
        } else {
            var nextShift = repository.findFirstByInicioAfterOrderByInicioAsc(LocalDateTime.now(clock))
                    .orElseThrow(() -> new KardexException("Nao existe turno para a data de hoje"));
            shiftChange = new PassagemTurno();
            shiftChange.setTurno(shift);
            shiftChange.setProximoTurno(nextShift);
            shift.setPassagemTurno(shiftChange);
        }

        var patients = shift.getAtribuicoes()
                .stream()
                .map(AtribuicaoUtente::getUtente)
                .toList();
        List<UtentePassagemTurnoDTO> patientsChange = getUtentePassagemTurnoDTOS(patients, shift);

        return new PassagemTurnoDTO(
                mapper.toLimitedDTO(shift),
                mapper.toLimitedDTO(shiftChange.getProximoTurno()),
                patientsChange,
                shift.getPassagemTurno().getObservacoes(),
                shift.getPassagemTurno().isPendente(),
                shift.getPassagemTurno().isAtivo()
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
  
    @Override
    @Transactional
    public void validateShiftChange(Long shiftId, CreateShiftChangeDTO data) {
        var shift = repository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        var shiftChange = shift.getPassagemTurno();
        if(shiftChange == null){
            throw new KardexException("Nao existe passagem de turno para o turno");
        }

        if(shiftChange.isAtivo()){
            throw new KardexException("A passagem de turno nao pode ser validade");
        }

        shiftChange.setPendente(false);
        shiftChange.setObservacoesValidacao(data.observacoes());
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
        shiftChange.setPendente(true);
        shiftChange.setObservacoes(null);
        shiftChange.setObservacoesValidacao(null);
    }

    @Override
    public TurnoDTO getPendingShift() {
        var worker = workerService.getAutenticatedWorker();
        var shift = repository.findMostRecentPendingShiftByWorker(worker.getId()).orElse(null);

        return mapper.toDTO(shift);
    }

    private  List<UtentePassagemTurnoDTO> getUtentePassagemTurnoDTOS(List<Utente> patients, Turno shift) {
        List<UtentePassagemTurnoDTO> patientsChange = new ArrayList<>();

        patients.forEach(p -> {
            var process = processService.getActiveProcess(p);
            var administrations = shift.getAdministracoes()
                    .stream()
                    .filter(a -> a.getPrescricao().getProcesso().equals(process))
                    .toList();

            var administrated    = administracaoMapper.toDTOList(administrations.stream().filter(a -> !a.getPrescricao().getSos() && a.getAdministrado()).toList());
            var notAdministrated = administracaoMapper.toDTOList(administrations.stream().filter(a -> !a.getAdministrado()).toList());
            var administratedSOS = administracaoMapper.toDTOList(administrations.stream().filter(a -> a.getPrescricao().getSos()).toList());
            var vitalSignInShift = processService.vitalSignsInShift(shift, process);
            var incidents = shift.getIncidentes().stream().filter(i -> i.getProcessoClinico().equals(process)).toList();

            patientsChange.add(new UtentePassagemTurnoDTO(
                    utenteMapper.toLimitedDto(p),
                    vitalSignInShift,
                    new AdministracoesDTO(administrated, notAdministrated, administratedSOS),
                    incidenteMapper.toDTOList(incidents)
            ));
        });
        return patientsChange;
    }
}
