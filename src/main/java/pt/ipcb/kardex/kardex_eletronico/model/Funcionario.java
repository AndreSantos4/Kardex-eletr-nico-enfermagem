package pt.ipcb.kardex.kardex_eletronico.model;

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
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @OneToOne(targetEntity = Utilizador.class)
    public Utilizador utilizador;
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToMany(fetch = FetchType.LAZY)
    public Set<Turno> turnos = new HashSet<>();
}
