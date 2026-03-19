package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "medicamento")
public class Medicamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @Column(name = "nome", nullable = false)
    public String nome;
    
    @Column(name = "principio_ativo", nullable = false)
    public String principioAtivo;
    
    @Column(name = "forma_farmaceutica", nullable = false)
    public String formaFarmaceutica;
    
    @Column(name = "quantidade", nullable = false)
    public Long quantidade;
    
    @Column(name = "unidade", nullable = false)
    @Enumerated(EnumType.STRING)
    public UnidadeMedida unidade;
    
    @Column(name = "data_validade", nullable = false)
    public LocalDate dataValidade;
    
    @JoinTable(
            name = "medicamento_via_administracao",
            joinColumns = @JoinColumn(name = "id_medicamento"),
            inverseJoinColumns = @JoinColumn(name = "id_via_administracao")
    )
    @ManyToMany(fetch = FetchType.EAGER)
    public Set<ViaAdministracao> viasAdministracao = new HashSet<>();

    @JoinTable(
            name = "medicamento_alerta",
            joinColumns = @JoinColumn(name = "id_medicamento"),
            inverseJoinColumns = @JoinColumn(name = "id_alerta")
    )
    @ManyToMany(fetch = FetchType.EAGER)
    public Set<Alerta> alertas = new HashSet<>();

    @JoinTable(
            name = "medicamento_alergia",
            joinColumns = @JoinColumn(name = "id_medicamento"),
            inverseJoinColumns = @JoinColumn(name = "id_alergia")
    )
    @ManyToMany(fetch = FetchType.EAGER)
    public Set<Alergia> alergiasIncompativeis = new HashSet<>();
}
