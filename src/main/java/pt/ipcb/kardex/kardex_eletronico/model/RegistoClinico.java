package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
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
    public Timestamp timestamp;
    
    @ManyToOne(targetEntity = Funcionario.class)
    public Funcionario funcionario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    public Utente utente;
}
