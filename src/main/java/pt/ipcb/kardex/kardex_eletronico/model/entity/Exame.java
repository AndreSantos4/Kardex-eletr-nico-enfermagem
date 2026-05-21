package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Urgencia;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "exame")
public class Exame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JoinColumn(name = "id_processo_clinico")
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @JoinColumn(name = "id_medico", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario medico;
    
    @Column(name = "tipo", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoExame tipo;
    
    @Column(name = "urgencia", nullable = false)
    @Enumerated(EnumType.STRING)
    public Urgencia urgencia;

    @Column(name = "data_pedido", nullable = false)
    public LocalDateTime dataPedido = LocalDateTime.now();
    
    @Column(name = "data_pretendida", nullable = false)
    public LocalDate dataPretendida;

    @Column(name = "indicacao_clinica", nullable = false)
    public String indicacaoClinica;

    @Column(name = "observacoes_laboratorio")
    public String observacoesLaboratorio;

    @Column(name = "estado", nullable = false)
    @Enumerated(EnumType.STRING)
    public EstadoExame estado = EstadoExame.PEDIDO_PENDENTE;
    
    @JoinColumn(name = "id_resultado_exame")
    @OneToOne(fetch = FetchType.EAGER)
    public ResultadoExame resultado;
}
