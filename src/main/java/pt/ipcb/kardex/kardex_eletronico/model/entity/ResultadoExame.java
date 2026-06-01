package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "resultado_exame")
public class ResultadoExame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "data", nullable = false)
    public LocalDate data;

    @Column(name = "atencao", nullable = false)
    public boolean atencao = false;

    @Column(name = "resultado", nullable = false)
    public String resultado;

    @Column(name = "atencao_descricao")
    public String atencaoDescricao;
}
