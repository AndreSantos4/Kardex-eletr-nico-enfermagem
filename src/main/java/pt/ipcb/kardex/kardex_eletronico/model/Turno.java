package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "turno")
public class Turno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    
    @Column(name = "inicio", nullable = false)
    public LocalDateTime inicio;
    
    @Column(name = "fim", nullable = false)
    public LocalDateTime fim;
    
    @ManyToMany(mappedBy = "turno", fetch = FetchType.LAZY)
    public Set<Funcionario> funcionariosAlocados = new HashSet<>();
}
