package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "contencao")
public class Contencao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;        

    @JoinColumn(name = "id_processo_clinico")
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @JoinColumn(name = "id_medico", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario medico;
    
    @JoinColumn(name = "id_medicamento", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Medicamento medicamento;
    
    @Column(name = "justificacao", nullable = false)
    public String justificacao;
    
    @Column(name = "dose", nullable = false)
    public Long dose;
    
    @Column(name = "duracao", nullable = false)
    public Integer duracao;
    
    @Column(name = "data", nullable = false)
    public LocalDate data;
}
