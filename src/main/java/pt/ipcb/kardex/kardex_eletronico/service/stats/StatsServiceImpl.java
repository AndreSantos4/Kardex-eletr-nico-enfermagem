package pt.ipcb.kardex.kardex_eletronico.service.stats;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.ReportsFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CateterUsoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexReportsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoRankingDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioAtividadeDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoCateter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;
import pt.ipcb.kardex.kardex_eletronico.repository.*;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.user.UserService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service    
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final UserService userService;
    private final PatientService patientService;
    private final StockService stockService;
    private final SessaoRepository sessaoRepository;
    private final WorkerService workerService;
    private final RecordService recordService;

    private final AdministracaoRepository administracaoRepository;
    private final IncidenteClinicoRepository incidenteClinicoRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final FuncionarioRepository repository;
    private final CateterRepository cateterRepository;

    @Override
    @Transactional(readOnly = true)
    public KardexCountsDTO getCounts(HttpServletRequest request) {
        var user = (Utilizador) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();

        var patientsCount = patientService.getHospitalizedPatientsCount();

        switch (user.getRole()) {
            case Role.ENFERMEIRO_CHEFE:
                var activeNurses = workerService.getActiveNursesCount();
                var acceptedPatientsToday = recordService.getAcceptedPatientsCountToday();
                var dischargedPatientsToday = recordService.getDischargedPatientsCountToday();

                return KardexCountsDTO.forChiefNurse(patientsCount, activeNurses, acceptedPatientsToday, dischargedPatientsToday);
            case Role.MEDICO:
                return KardexCountsDTO.forMedic(patientsCount);
            case Role.ADMIN:
                var usersCount = userService.getActiveUsersCount();
                var stocksCount = stockService.getMedicationsCount();
                var sessionsCount = sessaoRepository.count();

                return KardexCountsDTO.forAdmin(usersCount, patientsCount, sessionsCount, stocksCount);
            default:
                return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public KardexReportsDTO getReports(ReportsFilter filter) {
        LocalDateTime from = filter.de() != null ? LocalDateTime.of(filter.de(), LocalTime.MIDNIGHT) : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime to = filter.ate() != null ? LocalDateTime.of(filter.ate(), LocalTime.MIDNIGHT) : LocalDateTime.of(2099, 12, 31, 23, 59);

        var administrations = administracaoRepository.countByAdministradoFiltered(
                true, from, to);
        var nonAdministrations = administracaoRepository.countByAdministradoFiltered(
                false, from, to);
        var incidents = incidenteClinicoRepository.countIncidents(
                from, to);

        return new KardexReportsDTO(administrations, nonAdministrations, incidents);
    }

    @Transactional(readOnly = true)
    @Override
    public List<MedicamentoRankingDTO> getMedicationsRanking(ReportsFilter filter){
        LocalDateTime from = filter.de() != null ? LocalDateTime.of(filter.de(), LocalTime.MIDNIGHT) : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime to = filter.ate() != null ? LocalDateTime.of(filter.ate(), LocalTime.MIDNIGHT) : LocalDateTime.of(2099, 12, 31, 23, 59);
        
        return medicamentoRepository.findTop10MedicamentosDoMes(from, to)
                .stream()
                .map(row -> new MedicamentoRankingDTO(
                        (String) row[0],
                        (Long) row[1],
                        (BigDecimal) row[2],
                        (UnidadeMedida) row[3]
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<FuncionarioAtividadeDTO> getWorkerActivity(ReportsFilter filter) {
        LocalDateTime from = filter.de() != null ? LocalDateTime.of(filter.de(), LocalTime.MIDNIGHT) : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime to = filter.ate() != null ? LocalDateTime.of(filter.ate(), LocalTime.MIDNIGHT) : LocalDateTime.of(2099, 12, 31, 23, 59);
        
        var admins = repository.countAdministracoesByFuncionario(from, to)
                .stream().collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        var intervencoes = repository.countIntervencoesByFuncionario(from, to)
                .stream().collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        var turnos = repository.countTurnosByFuncionario(from, to)
                .stream().collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        return repository.findAll().stream()
                .map(f -> new FuncionarioAtividadeDTO(
                        f.id,
                        f.dados.nome,
                        admins.getOrDefault(f.id, 0L),
                        intervencoes.getOrDefault(f.id, 0L),
                        turnos.getOrDefault(f.id, 0L)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<CateterUsoDTO> getCateterUsage(ReportsFilter filter){
        LocalDateTime from = filter.de() != null ? LocalDateTime.of(filter.de(), LocalTime.MIDNIGHT) : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime to = filter.ate() != null ? LocalDateTime.of(filter.ate(), LocalTime.MIDNIGHT) : LocalDateTime.of(2099, 12, 31, 23, 59);
        
        return cateterRepository.countCateteresUsados(from, to)
                .stream()
                .map(row -> new CateterUsoDTO((TipoCateter) row[0], (String) row[1], (Long) row[2]))
                .toList();
    }
}
