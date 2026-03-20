package pt.ipcb.kardex.kardex_eletronico.model.entity;

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
@Table(name = "sinal_vital")
public class SinalVital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JoinColumn(name = "id_processo_clinico")
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario funcionario;
    
    @Column(name = "tensao_arterial_distolica", nullable = false)
    public Integer tensaoArteriaDistolica;
    
    @Column(name = "tensao_arterial_sistolica", nullable = false)
    public Integer tensaoArteriaSistolica;
    
    @Column(name = "frequencia_cardiaca", nullable = false)
    public Integer frequenciaCardiaca;
    
    @Column(name = "temperatura", nullable = false)
    public Integer temperatura;
    
    @Column(name = "spo2", nullable = false)
    public Integer spo2;
    
    @Column(name = "dor")
    public Short dor;
    
    @Column(name = "glicemia", nullable = false)
    public Integer glicemia;
    
    @Column(name = "observacoes")
    public String observacoes;
    
    @Column(name = "data", nullable = false)
    public LocalDateTime data;
}
