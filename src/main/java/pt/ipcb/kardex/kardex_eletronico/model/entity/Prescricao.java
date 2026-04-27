package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "prescricao")
public class Prescricao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_medicamento", nullable = false)
    @ManyToOne(fetch = FetchType.EAGER)
    public Medicamento medicamento;

    @JoinColumn(name = "id_processo", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private ProcessoClinico processo;
    
    @Column(name = "e_sos", nullable = false)
    public Boolean sos  = false;
    
    @Column(name = "motivo", nullable = false)
    public String motivo = "";
    
    @Column(name = "esta_ativa", nullable = false)
    public Boolean ativa = true;
    
    @Column(name = "data_inicio", nullable = false)
    public LocalDate dataInicio;
    
    @Column(name = "data_fim", nullable = false)
    public LocalDate dataFim;
    
    @JoinColumn(name = "id_dose", nullable = true)
    @ManyToOne(fetch = FetchType.EAGER)
    public Dosagem dose;
    
    @Column(name = "alto_risco", nullable = false)
    public boolean altoRisco = false;
    
    @JoinColumn(name = "id_frequencia", nullable = false)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    public Frequencia frequencia;
    
    @OneToMany(mappedBy = "prescricao", cascade = CascadeType.ALL)
    public List<AdministracaoMedicacao> administracoes = new ArrayList<>();
}
