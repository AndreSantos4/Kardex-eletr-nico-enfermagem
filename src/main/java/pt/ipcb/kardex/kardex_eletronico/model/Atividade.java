package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "atividade")
public class Atividade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_plano_cuidados", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public PlanoCuidados planoCuidados;
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario funcionario;
    
    @Column(name = "nome", nullable = false)
    public String nome;
    
    @Column(name = "foi_realizada")
    public Boolean realizada;
    
    @Column(name = "data_inicio", nullable = false)
    public LocalDateTime dataInicio;
    
    @Column(name = "data_realizacao")
    public Timestamp dataRealizacao;
}
