package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    public long id;
    
    @JoinColumn(name = "id_utilizador", nullable = false)
    @OneToOne(targetEntity = Utilizador.class)
    public Utilizador utilizador;
    
    @ManyToMany(targetEntity = Turno.class)
    public Set<Turno> turnos;
}
