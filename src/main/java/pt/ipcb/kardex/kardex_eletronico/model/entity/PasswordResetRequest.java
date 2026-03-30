package pt.ipcb.kardex.kardex_eletronico.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "password_reset_request")
public class PasswordResetRequest {
    @Id
    @Column(name = "numero_mecanografico", nullable = false)
    private Long numeroMecanografico;

    @Column(name = "token", nullable = false)
    private String token;

    @Column(name = "pedido_em", nullable = false)
    private LocalDateTime pedidoEm;
}
