package pt.ipcb.kardex.kardex_eletronico.model.entity;

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
@Table(name = "via_admistracao")
public class ViaAdministracao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   
    public Integer id;
    
    @Column(name = "nome", nullable = false)  
    public String nome;
}
