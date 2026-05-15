package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "passagem_turno")
public class PassagemTurno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @OneToOne(fetch = FetchType.EAGER)
    public Turno turno;

    @OneToOne(fetch = FetchType.EAGER)
    public Turno proximoTurno;

    @Column(name = "observacoes", nullable = false)
    public String observacoes;

    @Column(name = "pendente", nullable = false)
    public boolean pendente = true;
}
