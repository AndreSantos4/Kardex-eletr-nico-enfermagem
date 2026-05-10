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
@Table(name = "atribuicao_utente")
public class AtribuicaoUtente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "id_enfermeiro", nullable = false)
    @ManyToOne(fetch = FetchType.EAGER)
    public Funcionario enfermeiro;

    @JoinColumn(name = "id_utente", nullable = false)
    @ManyToOne(fetch = FetchType.EAGER)
    public Utente utente;

    @JoinColumn(name = "id_turno", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Turno turno;
}
