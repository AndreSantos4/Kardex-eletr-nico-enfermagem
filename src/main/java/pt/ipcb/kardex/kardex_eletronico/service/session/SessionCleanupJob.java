package pt.ipcb.kardex.kardex_eletronico.service.session;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;

@Component
@RequiredArgsConstructor
public class SessionCleanupJob {

    private static final int CLEANING_RATE_MILISECONDS = 5 * 60 * 1000;

    private final SessaoRepository repository;

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void cleanExpiredSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(8);
        repository.deleteAllByInicioBefore(cutoff);
        System.out.println(">>> Sessões expiradas removidas antes de: " + cutoff);
    }
}
