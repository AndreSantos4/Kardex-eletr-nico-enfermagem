package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoNotaEvolucaoClinica;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "nota_evolucao_clinica")
public class NotaEvolucaoClinica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_processo_clinico", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @JoinColumn(name = "id_medico", nullable = false)
    @ManyToOne(fetch = FetchType.EAGER)
    public Funcionario medico;
    
    @Column(name = "tipo", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoNotaEvolucaoClinica tipo;
    
    @Column(name = "justificacao_clinica")
    public String justificacaoClinica;
    
    @Column(name = "data", nullable = false)
    public LocalDateTime data;
}
