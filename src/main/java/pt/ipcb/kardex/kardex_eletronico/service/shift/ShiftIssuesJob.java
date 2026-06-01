package pt.ipcb.kardex.kardex_eletronico.service.shift;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShiftIssuesJob{

    private final int BUILD_PENDING_ISSUES_RATE = 10 * 60 * 1000;
    private final ShiftService shiftService;

    @Scheduled(fixedRate = BUILD_PENDING_ISSUES_RATE)
    @Transactional
    public void executeShiftChanges() {
        var shift = shiftService.getCurrentShift();

        if(shift == null){
            log.warn("Nenhum turno a decorrer");
            return;
        }
        
        var issues = shiftService.getPendingIssues(shift.id());

        log.info("{} pendencias marcadas para o turno de id {}", issues.size(), shift.id());
    }
}