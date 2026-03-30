package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "servico")
public class Servico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    
    @Column(name = "nome", nullable = false) 
    public String nome;
    
    @Column(name = "descricao")
    public String descricao;
    
    @JoinTable(
            name = "servico_medicamento",
            joinColumns = @JoinColumn(name = "id_servico"),
            inverseJoinColumns = @JoinColumn(name = "id_medicamento")
    )
    @ManyToMany(fetch = FetchType.LAZY)
    public Set<Medicamento> medicamentos = new HashSet<>();
}
