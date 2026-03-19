package pt.ipcb.kardex.kardex_eletronico.model;

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
    @ManyToOne(fetch = FetchType.LAZY)
    public Medicamento medicamento;
    
    @Column(name = "e_sos", nullable = false)
    public Boolean sos;
    
    @Column(name = "motivo")
    public String motivo;
    
    @Column(name = "esta_ativa", nullable = false)
    public Boolean ativa;
    
    @Column(name = "data_inicio", nullable = false)
    public LocalDate dataInicio;
    
    @Column(name = "dose", nullable = false)
    public Integer dose;
    
    @Column(name = "duracao_dias", nullable = false)
    public Integer duracaoDias;
    
    @OneToMany(mappedBy = "prescricao", cascade = CascadeType.ALL)
    public List<AdministracaoMedicacao> administracoes = new ArrayList<>();
}
