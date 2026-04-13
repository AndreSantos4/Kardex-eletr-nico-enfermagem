package pt.ipcb.kardex.kardex_eletronico.service.worker;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.ShiftSummaryDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.WorkerActivitySummary;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.UnwantedResourceException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.FuncionarioMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.FuncionarioRepository;
import pt.ipcb.kardex.kardex_eletronico.service.user.UserService;

@Service
@RequiredArgsConstructor
public class WorkerServiceImpl implements WorkerService {

    private static final int SHIFTS_INFO_RANGE_MONTHS = -28;

    private final FuncionarioRepository repository;
    private final FuncionarioMapper mapper;
    private final TurnoRepository shiftRepository;
    private final TurnoMapper turnoMapper;

    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public FuncionarioDTO getWorkerFromUserId(Long userId) {
        var worker = repository.findByUserId(userId)
                .orElseThrow(() -> EntityNotFoundException.forId(userId, "Utilizador"));
        return mapper.toDTO(worker);
    }

    @Override
    @Transactional
    public void createWorkerByUser(Utilizador user) {
        var worker = new Funcionario(user);
        repository.save(worker);
    }

    @Override
    @Transactional
    public void addToShift(Long workerId, Long shiftId) {
        var worker = repository.findById(workerId)
                .orElseThrow(() -> EntityNotFoundException.forId(workerId, "Funcionário"));
        var shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        worker.turnos.add(shift);
        shift.funcionariosAlocados.add(worker);

        repository.save(worker);
    }

    @Override
    @Transactional
    public void removeFromShift(Long workerId, Long shiftId) {
        var worker = repository.findById(workerId)
                .orElseThrow(() -> EntityNotFoundException.forId(workerId, "Funcionário"));
        var shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> EntityNotFoundException.forId(shiftId, "Turno"));

        worker.turnos.remove(shift);
        shift.funcionariosAlocados.remove(worker);

        repository.save(worker);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoDTO> getWorkerShifts(Long id, int range) {
        var from = LocalDateTime.now();
        var to = from.plusDays(range);
        List<Turno> turnos = range >= 0 ? repository.findNextTurnos(id, from, to)
                : repository.findPreviousTurnos(id, from, to);

        return turnos
                .stream()
                .map(turnoMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Funcionario getAutenticatedWorker(HttpServletRequest request) {
        var user = userService.getUserByToken(request);
        return repository.findByUserId(user.id())
                .orElseThrow(() -> EntityNotFoundException.forId(user.id(), "Funcionario"));
    }

    @Override
    @Transactional(readOnly = true)
    public Turno getCurrentShift(Long id) {
        return repository.findCurrentTurno(id, LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShiftSummaryDTO> getWorkerShiftsInfo(Long id) {
        var shifts = getWorkerShifts(id, SHIFTS_INFO_RANGE_MONTHS);
        var shiftIds = shifts.stream().map(TurnoDTO::id).toList();

        Map<Long, Integer> incidentCounts = toCountMap(repository.countIncidentsByTurnoIds(shiftIds));
        Map<Long, Integer> adminCounts = toCountMap(repository.countAdministracoesByTurnoIds(shiftIds));

        return shifts.stream()
                .map(shift -> new ShiftSummaryDTO(
                        shift.nome(),
                        adminCounts.getOrDefault(shift.id(), 0),
                        incidentCounts.getOrDefault(shift.id(), 0),
                        shift.inicio().toLocalDate()))
                .toList();
    }

    private Map<Long, Integer> toCountMap(List<Object[]> results) {
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Long) row[1]).intValue()));
    }

    @Override
    @Transactional(readOnly = true)
    public WorkerActivitySummary getWorkerActivitySummary(Long workerId) {
        var worker = repository.findById(workerId)
                .orElseThrow(() -> EntityNotFoundException.forId(workerId, "Funcionário"));
        var lastActivity = worker.getDados().getDataUltimaAtividade();
        var shiftsThisMonth = repository.getShiftsCountThisMonthById(workerId);
        var incidentsThisMonth = repository.getIncidentsCountThisMonthById(workerId);
        var administrationsThisMonth = repository.getAdministrationsCountThisMonth(workerId);

        return new WorkerActivitySummary(lastActivity, shiftsThisMonth, incidentsThisMonth, administrationsThisMonth);
    }

    @Override
    @Transactional(readOnly = true)
    public Funcionario getMedicById(long medicoId) {
        var worker = repository.findById(medicoId)
                .orElseThrow(() -> EntityNotFoundException.forId(medicoId, "Funcionario"));

        if(worker.getDados().getRole() != Role.MEDICO){
                throw new UnwantedResourceException("O funcionario com id " + medicoId +  " nao e um medico");
        }

        return worker;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FuncionarioDTO> getAllMedics() {
        var teste = repository.findByDadosRole(Role.MEDICO);
        return mapper.toDTOList(teste);
    }

    @Override
    public long getActiveNursesCount() {
        return repository.countByDadosRoleAndDadosAtivo(Role.ENFERMEIRO, true);
    }
}
