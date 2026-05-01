package pt.ipcb.kardex.kardex_eletronico.service.session;

import java.time.Clock;
import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionCleanupJob {

    private static final int CLEANING_RATE_MILISECONDS = 5 * 60 * 1000;

    private final Clock clock;

    private final SessaoRepository repository;

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void cleanExpiredSessions() {
        var cutoff = LocalDateTime.now(clock).minusHours(8);
        repository.deleteAllByInicioBefore(cutoff);
        log.info("Sessões expiradas removidas antes de: " + cutoff);
    }
}
