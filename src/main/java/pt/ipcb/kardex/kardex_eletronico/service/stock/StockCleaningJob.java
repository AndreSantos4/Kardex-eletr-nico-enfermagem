package pt.ipcb.kardex.kardex_eletronico.service.stock;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;

import java.time.Clock;
import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockCleaningJob {

    private static final int CLEANING_RATE_MILISECONDS = 24 * 60 * 60 * 1000;

    private final Clock clock;

    private final MedicamentoRepository repository;

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void cleanExpiredMedications() {
        var cutoff = LocalDate.now(clock);
        repository.deleteExpiredBatches(cutoff);
        log.info("Lotes expirados removidas antes de: " + cutoff);
    }

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void cleanEmptyBatches() {
        repository.deleteEmptyBatches();
        log.info("Lotes vazios removidos");
    }
}
