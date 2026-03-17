package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import static jakarta.persistence.GenerationType.IDENTITY;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "utilizador")
public class Utilizador {
    @Id
    @GeneratedValue(strategy = IDENTITY)
    public long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    public Role role;
    
    @Column(name = "numero_mecanografico", nullable = false, unique = true)
    public long numeroMecanografico;
    
    @Column(name = "nome", nullable = false)
    public String nome;
    
    @Column(name = "sexo", nullable = false)
    public char sexo;
    
    @Column(name = "email", nullable = false, unique = true)
    public String email;
    
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;
    
    @Column(name = "contacto", nullable = false)
    public int contacto;
    
    @Column(name = "contacto_emergencia", nullable = false)
    public int contactoEmergencia;
    
    public LocalDateTime dataCriacao;
    
    public LocalDateTime dataUltimaAtividade;
    
    public boolean ativo = false;
}
