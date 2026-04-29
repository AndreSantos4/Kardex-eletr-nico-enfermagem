package pt.ipcb.kardex.kardex_eletronico.model.entity;

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
    public Long id;
    
    @JoinColumn(name = "id_utente", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Utente utente;
    
    @Column(name = "diagnostico_principal", nullable = false)
    public String diagnosticoPrincipal;

    @Column(name = "motivo_internamento", nullable = false)
    public String motivoInternamento;
    
    @JoinColumn(name = "id_cama")
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    public Cama cama;

    @JoinColumn(name = "id_medico")
    @ManyToOne(fetch = FetchType.EAGER)
    public Funcionario medicoResponsavel;
    
    @Column(name = "data_entrada", nullable = false)
    public LocalDateTime dataEntrada = LocalDateTime.now();
    
    @Column(name = "data_saida")
    public LocalDateTime dataSaida;
    
    @Column(name = "alta")
    public Boolean alta = false;

    @Column(name = "notas_alta")
    public String notasAlta;
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public Set<SinalVital> sinaisVitais = new HashSet<>();

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL)
    public Set<Prescricao> prescricoes = new HashSet<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<Exame> exames = new ArrayList<>();
    
    @JoinColumn(name = "id_servico")
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    public Servico servico;
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<PlanoCuidados> planoCuidados = new ArrayList<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<Contencao> contencoes = new ArrayList<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<NotaEvolucaoClinica> notasEvolucaoClinica = new ArrayList<>();
    
    @OneToMany(mappedBy = "processoClinico", cascade = CascadeType.ALL)
    public List<Cateter> cateteres = new ArrayList<>();
}
