package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.PasswordResetRequest;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

	void deleteAllByPedidoEmBefore(LocalDateTime cutoff);

    PasswordResetRequest findByTokenHash(String hashToken);

}
