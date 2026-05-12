package pt.ipcb.kardex.kardex_eletronico.service.shift;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.AssignNursesDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateIncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AtribuicaoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService{

    private final Clock clock;

    private final TurnoRepository repository;
    private final TurnoMapper mapper;
    private final WorkerService workerService;
    private final PatientService patientService;

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
}
