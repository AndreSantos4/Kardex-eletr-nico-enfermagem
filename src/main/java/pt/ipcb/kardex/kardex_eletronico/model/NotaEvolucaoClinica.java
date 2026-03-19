package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario medico;
    
    @Column(name = "tipo_nota", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoNotaEvolucaoClinica tipo;
    
    @Column(name = "descricao")
    public String descricao;
    
    @Column(name = "data_emitida", nullable = false)
    public LocalDateTime dataEmitida;
}
