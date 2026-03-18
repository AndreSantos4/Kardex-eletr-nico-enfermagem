package pt.ipcb.kardex.kardex_eletronico.model;

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
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Prescricao prescricao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario funcionario;
    
    @Column(name = "observacoes")
    public String observacoes;
    
    @Column(name = "foi_administrado")
    public Boolean administrado;
    
    @Column(name = "timestamp")
    public Timestamp timestamp;
}
