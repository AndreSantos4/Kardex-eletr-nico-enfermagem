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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proximo_turno_id") // no unique = true
    public Turno proximoTurno;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "observacoes")
    public String observacoes;

    @Column(name = "observacoes_validacao")
    public String observacoesValidacao;

    @Column(name = "pendente", nullable = false)
    public boolean pendente = true;
}
