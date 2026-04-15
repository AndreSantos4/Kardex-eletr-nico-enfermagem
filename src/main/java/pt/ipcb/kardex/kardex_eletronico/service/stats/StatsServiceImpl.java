package pt.ipcb.kardex.kardex_eletronico.service.stats;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.user.UserService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;

@Service    
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final UserService userService;
    private final PatientService patientService;
    private final StockService stockService;
    private final SessaoRepository sessaoRepository;
    private final WorkerService workerService;
    private final RecordService recordService;

    @Override
    @Transactional(readOnly = true)
    public KardexCountsDTO getCounts(HttpServletRequest request) {
        var worker = workerService.getAutenticatedWorker(request);
        var workerRole = worker.getDados().getRole();

        var patientsCount = patientService.getHospitalizedPatientsCount();

        switch (workerRole) {
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
}
