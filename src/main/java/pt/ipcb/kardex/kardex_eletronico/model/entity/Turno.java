package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;

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

    @Column(name = "tipo", nullable = false)
    public TipoTurno tipo;
    
    @Column(name = "inicio", nullable = false)
    public LocalDateTime inicio;

    @Column(name = "fim", nullable = false)
    public LocalDateTime fim;

    @Column(name = "observacoes", nullable = false)
    public String observacoes;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public PassagemTurno passagemTurno;
    
    @ManyToMany(mappedBy = "turnos", fetch = FetchType.LAZY)
    public Set<Funcionario> enfermeiros = new HashSet<>();

    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<AtribuicaoUtente> atribuicoes = new ArrayList<>();

    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<AdministracaoMedicacao> administracoes = new ArrayList<>();

    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<IncidenteClinico> incidentes = new ArrayList<>();
}
