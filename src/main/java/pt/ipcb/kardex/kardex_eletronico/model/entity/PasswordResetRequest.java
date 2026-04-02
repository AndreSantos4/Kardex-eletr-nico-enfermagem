package pt.ipcb.kardex.kardex_eletronico.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
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

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Transient
    private String tokenUUID;

    @Column(name = "pedido_em", nullable = false)
    private LocalDateTime pedidoEm;

    public boolean isValid(int expiry){
        return pedidoEm.plusMinutes(expiry).isAfter(LocalDateTime.now());
    }
}
