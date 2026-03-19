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
@Table(name = "exame")
public class Exame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_medico", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario medico;
    
    @Column(name = "tipo_exame", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoExame tipoExame;
    
    @Column(name = "urgencia", nullable = false)
    @Enumerated(EnumType.STRING)
    public Urgencia urgencia;
    
    @Column(name = "medidas_tomadas")
    public String medidasTomadas;
    
    @Column(name = "data_pretendida", nullable = false)
    public LocalDateTime dataPretendida;
    
    @Column(name = "indicacao_clinica")
    public String indicacaoClinica;
    
    @Column(name = "realizado", nullable = false)
    public Boolean realizado;
    
    @Column(name = "obervacoes")
    public String obervacoes;
    
    @JoinColumn(name = "id_resultado_exame", nullable = false)
    @OneToOne(fetch = FetchType.EAGER)
    public ResultadoExame resultado;
}
