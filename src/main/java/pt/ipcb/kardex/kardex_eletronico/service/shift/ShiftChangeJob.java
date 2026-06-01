package pt.ipcb.kardex.kardex_eletronico.service.shift;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;

import java.time.Clock;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShiftChangeJob {

    private static final int CLEANING_RATE_MILISECONDS = 5 * 60 * 1000;

    private final Clock clock;

    private final TurnoRepository repository;
    private final ShiftService shiftService;

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void executeShiftChanges() {
        var now = LocalDateTime.now(clock);
        var shifts = repository.findAllWithoutPassagemTurnoBeforeNow(now);

        shifts.forEach(shift -> {
            try {
                shiftService.getShiftChange(shift.getId());
            } catch (Exception ex) {
                log.warn("Nao foi possivel processar passagem de turno para turno {}: {}", shift.getId(), ex.getMessage());
            }
        });

        log.info("Passagens de turno processadas para {} turno(s) antes de: {}", shifts.size(), now);
    }
}
