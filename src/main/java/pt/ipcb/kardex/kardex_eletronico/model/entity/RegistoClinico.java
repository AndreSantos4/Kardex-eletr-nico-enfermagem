package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegistoClinico;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "registo_clinico")
public class RegistoClinico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    
    @Column(name = "timestamp", nullable = false)
    public LocalDateTime timestamp = LocalDateTime.now();
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToOne(targetEntity = Funcionario.class, fetch = FetchType.EAGER)
    public Funcionario funcionario;
    
    @JoinColumn(name = "id_processo", nullable = false)
    @ManyToOne(fetch = FetchType.EAGER)
    public ProcessoClinico processo;

    @Column(name = "tipo", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoRegistoClinico tipo;

    @Column(name = "detalhes")
    public String detalhes;

    @Column(name = "detalhes_numericos")
    public float detalhesNumericos;
}
