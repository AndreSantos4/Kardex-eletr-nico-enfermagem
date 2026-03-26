package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.security.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "administracao_medicacao")
public class AdministracaoMedicacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    public Long id;
    
    @JoinColumn(name = "id_prescricao", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Prescricao prescricao;
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario funcionario;

    @JoinColumn(name = "id_turno", nullable = false)
    @ManyToOne
    public Turno turno;
    
    @Column(name = "observacoes")
    public String observacoes;
    
    @Column(name = "foi_administrado")
    public Boolean administrado;
    
    @Column(name = "timestamp")
    public Timestamp timestamp;
}
