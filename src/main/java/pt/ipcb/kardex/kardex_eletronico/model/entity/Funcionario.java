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
@Table(name = "funcionario")
public class Funcionario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_utilizador", nullable = false)
    @OneToOne(fetch = FetchType.EAGER)
    public Utilizador utilizador;
    
    @JoinTable(
            name = "funcionario_turno",
            joinColumns = @JoinColumn(name = "id_funcionario"),
            inverseJoinColumns = @JoinColumn(name = "id_turno")
    )
    @ManyToMany(fetch = FetchType.LAZY)
    public Set<Turno> turnos = new HashSet<>();
}
