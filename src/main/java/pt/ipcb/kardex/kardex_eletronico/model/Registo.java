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
    public long id;
    
    @JoinColumn(name = "id_utilizador", nullable = false)
    @ManyToOne(targetEntity = Utilizador.class)
    public Utilizador utilizador;
    
    @Column(name = "nivel_registo", nullable = false)
    @Enumerated(EnumType.STRING)
    public NivelRegisto nivelRegisto;
    
    @Column(name = "tipo_registo", nullable = false)
    @Enumerated(EnumType.STRING)
    public TipoRegisto tipoRegisto;
    
    public String tabelaOrigem;
    
    public String mensagem;
    
    public String detalhes;
}
