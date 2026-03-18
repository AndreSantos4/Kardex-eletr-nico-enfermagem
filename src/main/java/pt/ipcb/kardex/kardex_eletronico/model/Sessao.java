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
@Table(name = "sessao")
public class Sessao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    
    @JoinColumn(name = "id_sessao", nullable = false)
    @OneToOne(fetch = FetchType.EAGER)
    public Utilizador utilizador;
    
    @Column(name = "endereco_ip", nullable = false)
    public String enderecoIP;
}
