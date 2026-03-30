package pt.ipcb.kardex.kardex_eletronico.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tentativa_login")
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class TentativaLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_mecanografico")
    private Long numeroMecanografico;

    @Column(name = "endereco_ip", nullable = false)
    private String enderecoIP;

    @Column(name = "sucesso", nullable = false)
    private boolean sucesso;

    @Column(name = "tentou_em", nullable = false)
    private LocalDateTime tentouEm;

    @Column(name = "motivo_falha")
    private String motivoFalha;
}
