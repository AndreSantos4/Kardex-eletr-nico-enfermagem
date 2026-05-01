package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.time.Clock;
import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.PrescriptionState;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class PrescriptionExpiryJob {
    private static final int CLEANING_RATE_MILISECONDS = 5 * 60 * 1000;

    private final Clock clock;

    private final PrescricaoRepository repository;

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void finalizeExpiredPrescriptions() {
        var cutoff = LocalDate.now(clock);
        int updated = repository.updateExpiredPrescriptions(cutoff, PrescriptionState.TERMINADA);
        log.info("Prescricoes finalizadas: {} antes de: {}", updated, cutoff);
    }
}
