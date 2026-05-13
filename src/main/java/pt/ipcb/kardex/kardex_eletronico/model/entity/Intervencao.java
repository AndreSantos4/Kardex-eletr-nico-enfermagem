package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FrequenciaIntervencao;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.IntervencaoDiagnostico;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrioridadeIntervencao;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoIntervencao;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "intervencao")
public class Intervencao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_plano_cuidados", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public PlanoCuidados planoCuidados;
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario funcionario;

    @Column(name = "diagnostico", nullable = false)
    @Enumerated(EnumType.STRING)
    public IntervencaoDiagnostico diagnostico;

    @Column(name = "intervencao", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoIntervencao intervencao;

    @Column(name = "frequencia", nullable = false)
    @Enumerated(EnumType.STRING)
    public FrequenciaIntervencao frequencia;

    @Column(name = "prioridade", nullable = false)
    @Enumerated(EnumType.STRING)
    public PrioridadeIntervencao prioridade;

    @Column(name = "horario_previsto")
    public String horarioPrevisto;

    @Column(name = "data", nullable = false)
    public LocalDateTime data;

    @Column(name = "data_execucao")
    public LocalDateTime dataExecucao;

    @Column(name = "observacoes_execucao")
    public String observacoesExecucao;

    @Column(name = "objetivo")
    public String objetivo;
}
