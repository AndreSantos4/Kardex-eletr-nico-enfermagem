package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    public Integer numeroCC;
    
    @Column(name = "primeiro_nome", nullable = false)
    public String primeiroNome;
    
    @Column(name = "apelido", nullable = false)
    public String apelido;
    
    @Column(name = "sexo", nullable = false)
    public Character sexo;
    
    @Column(name = "contacto", nullable = false)
    public Integer contacto;
    
    @Column(name = "contacto_emergencia", nullable = false)
    public Integer contactoEmergencia;
    
    @Column(name = "estado", nullable = false)
    @Enumerated(EnumType.STRING)
    public EstadoUtente estadoUtente;
    
    @OneToMany(mappedBy = "utente", cascade = CascadeType.ALL)
    public List<ProcessoClinico> processosClinicos = new ArrayList<>();
    
    @JoinColumn(name = "id_utente", nullable = false)
    @ManyToMany(mappedBy = "utentes", fetch = FetchType.LAZY)
    public Set<Alergia> alergias = new HashSet<>();
    
    @JoinColumn(name = "id_utente", nullable = false)
    @ManyToMany(mappedBy = "utentes", fetch = FetchType.LAZY)
    public Set<FlagRisco> flagRiscos = new HashSet<>();
    
    @OneToMany(mappedBy = "utente", cascade = CascadeType.ALL)
    public List<RegistoClinico> historico = new ArrayList<>();
}
