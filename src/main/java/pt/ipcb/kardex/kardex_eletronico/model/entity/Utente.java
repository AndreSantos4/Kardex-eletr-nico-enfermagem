package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "utente")
public class Utente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @Column(name = "numero_sns", nullable = false)
    public Integer numeroSNS;
    
    @Column(name = "numero_cc", nullable = false)
    public String numeroCC;
    
    @Column(name = "nome", nullable = false)
    public String nome;
    
    @Column(name = "sexo", nullable = false)
    @Enumerated(EnumType.STRING)
    public Sexo sexo;
    
    @Column(name = "contacto", nullable = false)
    public Integer contacto;
    
    @Column(name = "contacto_emergencia", nullable = false)
    public Integer contactoEmergencia;

    @Column(name = "data_nascimento")
    public LocalDate dataNascimento;
    
    @Column(name = "estado", nullable = false)
    @Enumerated(EnumType.STRING)
    public EstadoUtente estado = EstadoUtente.EM_ANALISE;
    
    @OneToMany(mappedBy = "utente", cascade = CascadeType.ALL)
    public List<ProcessoClinico> processosClinicos = new ArrayList<>();
    
    @JoinTable(
            name = "utente_alergia",
            joinColumns = @JoinColumn(name = "id_utente"),
            inverseJoinColumns = @JoinColumn(name = "id_alergia")
    )
    @ManyToMany
    public Set<Alergia> alergias = new HashSet<>();

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "utente_flags", joinColumns = @JoinColumn(name = "id_utente"))
    @Column(name = "flag_risco")
    public Set<FlagRisco> flagRiscos = new HashSet<>();
    
    @OneToMany(mappedBy = "utente", cascade = CascadeType.ALL)
    public List<RegistoClinico> historico = new ArrayList<>();
}
