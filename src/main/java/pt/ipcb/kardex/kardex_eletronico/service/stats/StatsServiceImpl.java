package pt.ipcb.kardex.kardex_eletronico.service.stats;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.user.UserService;

@Service    
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final UserService userService;
    private final PatientService patientService;
    private final StockService stockService;
    private final SessaoRepository sessaoRepository;

    @Override
    @Transactional(readOnly = true)
    public KardexCountsDTO getCounts() {
        var usersCount = userService.getActiveUsersCount();
        var patientsCount = patientService.getHospitalizedPatientsCount();
        var stocksCount = stockService.getMedicationsCount();
        var sessionsCount = sessaoRepository.count();

        return new KardexCountsDTO(usersCount, patientsCount, sessionsCount, stocksCount);
    }
}
