package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

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
    public Timestamp timestamp;
    
    @JoinColumn(name = "id_funcionario", nullable = false)
    @ManyToOne(targetEntity = Funcionario.class)
    public Funcionario funcionario;
    
    @JoinColumn(name = "id_utente", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Utente utente;
}
