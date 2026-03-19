package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "plano_cuidados")
public class PlanoCuidados {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public ProcessoClinico processoClinico;
    
    @Column(name = "versao", nullable = false)
    public Integer versao;
    
    @Column(name = "data_criacao", nullable = false)
    public LocalDate dataCriacao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Funcionario autor;
    
    @Column(name = "esta_ativo", nullable = false)
    public Boolean ativo;
    
    @OneToMany(mappedBy = "planoCuidados", cascade = CascadeType.ALL)
    public List<Atividade> atividades;
}

