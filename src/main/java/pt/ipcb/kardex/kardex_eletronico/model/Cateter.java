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
@Table(name = "cateter")
public class Cateter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_cateter", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario funcionario;
    
    @Column(name = "calibre_cateter", nullable = false)
    @Enumerated(EnumType.STRING)
    public CalibreCateter calibre;
    
    @Column(name = "data_insercao", nullable = false)
    public LocalDateTime dataInsercao;
    
    @Column(name = "data_substituicao")
    public LocalDateTime dataSubstituicao;
    
    @Column(name = "local_insercao", nullable = false)
    public String localInsercao;
    
    @Column(name = "estado_cateter", nullable = false)
    public EstadoCateter estado;
    
    @Column(name = "observacoes")
    public String observacoes;
}
