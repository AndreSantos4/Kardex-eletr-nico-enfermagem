package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "processo_clinico")
public class ProcessoClinico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Utente utente;
    
    @Column(name = "diagnostico_principal", nullable = false)
    public String diagnosticoPrincipal;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Cama cama;
    
    @Column(name = "data_entrada", nullable = false)
    public LocalDateTime dataEntrada;
    
    @Column(name = "data_saida")
    public LocalDateTime dataSaida;
    
    @Column(name = "alta")
    public Boolean alta;
    
    @ManyToMany(fetch = FetchType.LAZY)
    public Set<Prescricao> prescricoes = new HashSet<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<SinalVital> sinaisVitais = new ArrayList<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<Exame> exames = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Servico servico;
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<PlanoCuidados> planoCuidados = new ArrayList<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<Contencao> contencoes = new ArrayList<>();
}
