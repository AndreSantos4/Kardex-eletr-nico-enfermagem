package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
    public Long id;

    @Column(name = "nome", nullable = false)
    public String nome;
    
    @Column(name = "inicio", nullable = false)
    public LocalDateTime inicio;

    @Column(name = "fim", nullable = false)
    public LocalDateTime fim;
    
    @ManyToMany(mappedBy = "turnos")
    public Set<Funcionario> funcionariosAlocados = new HashSet<>();

    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL)
    public List<AdministracaoMedicacao> administracoes = new ArrayList<>();

    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL)
    public List<IncidenteClinico> incidentes = new ArrayList<>();
}
