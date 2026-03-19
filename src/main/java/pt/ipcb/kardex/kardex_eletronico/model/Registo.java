package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "registo")
public class Registo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @JoinColumn(name = "id_utilizador", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Utilizador utilizador;
    
    @Column(name = "nivel_registo", nullable = false)
    @Enumerated(EnumType.STRING)
    public NivelRegisto nivelRegisto;
    
    @Column(name = "tipo_registo", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoRegisto tipoRegisto;
    
    @Column(name = "tabela_origem")
    public String tabelaOrigem;
    
    @Column(name = "mensageem", nullable = false)
    public String mensagem;
    
    @Column(name = "detalhes")
    public String detalhes;
}
