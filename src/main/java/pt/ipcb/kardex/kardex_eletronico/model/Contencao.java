package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "contencao")
public class Contencao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;        
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario medico;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Medicamento medicamento;
    
    @Column(name = "justificacao", nullable = false)
    public String justificacao;
    
    @Column(name = "dose", nullable = false)
    public Long dose;
    
    @Column(name = "duracao", nullable = false)
    public int duracao;
    
    @Column(name = "data", nullable = false)
    public LocalDate data;
}
