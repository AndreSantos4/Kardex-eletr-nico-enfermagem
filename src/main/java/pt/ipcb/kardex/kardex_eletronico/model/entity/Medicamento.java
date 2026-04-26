package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ClasseFarmacologica;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FormaFarmaceutica;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ViaAdministracao;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
    @Enumerated(EnumType.STRING)
    public FormaFarmaceutica formaFarmaceutica;
    
    @Column(name = "classe_farmacologica", nullable = false)
    @Enumerated(EnumType.STRING)
    public ClasseFarmacologica classeFarmacologica;
    
    @OneToMany(mappedBy = "medicamento", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Dosagem> dosagens = new ArrayList<>();
    
    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "id_dosagem_max")
    public Dosagem dosagemMaxDiaria;
    
    @Column(name = "quantidade", nullable = false)
    public Long quantidade = 0l;
    
    @Column(name = "unidadeMedida", nullable = false)
    @Enumerated(EnumType.STRING)
    public UnidadeMedida unidadeMedida;
    
    @Column(name = "viaAdministracao", nullable = false)
    @Enumerated(EnumType.STRING)
    public ViaAdministracao viaAdministracao;

    @Column(name = "altoRisco")
    public boolean altoRisco = false;
    
    @Column(name = "is_active", nullable = false)
    public boolean active = true;

    @JoinTable(
            name = "medicamento_alergia",
            joinColumns = @JoinColumn(name = "id_medicamento"),
            inverseJoinColumns = @JoinColumn(name = "id_alergia")
    )
    @ManyToMany(fetch = FetchType.LAZY)
    public Set<Alergia> alergiasIncompativeis = new HashSet<>();
}
