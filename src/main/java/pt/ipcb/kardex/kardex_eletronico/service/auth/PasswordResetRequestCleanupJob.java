package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import pt.ipcb.kardex.kardex_eletronico.repository.PasswordResetRequestRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordResetRequestCleanupJob {

    private static final int CLEANING_RATE_MILISECONDS = 5 * 60 * 1000;
    private static final int EXPIRATION_TIME_MINUTES = 15;

    private final PasswordResetRequestRepository repository;

    @Scheduled(fixedRate = CLEANING_RATE_MILISECONDS)
    @Transactional
    public void cleanExpiredSessions() {
        var cutoff = LocalDateTime.now().minusMinutes(EXPIRATION_TIME_MINUTES);
        repository.deleteAllByPedidoEmBefore(cutoff);
        log.info("Pedidos de redefinição de senha expiradas removidas antes de: " + cutoff);
    }
}
