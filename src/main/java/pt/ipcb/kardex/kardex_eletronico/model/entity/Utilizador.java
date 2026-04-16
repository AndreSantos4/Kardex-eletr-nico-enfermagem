package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.*;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonFormat;

import static jakarta.persistence.GenerationType.IDENTITY;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "utilizador")
public class Utilizador implements UserDetails{
    @Id
    @GeneratedValue(strategy = IDENTITY)
    public Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    public Role role;
    
    @Column(name = "numero_mecanografico", nullable = false, unique = true)
    public Long numeroMecanografico;

    @Column(name = "numero_cc", unique = true)
    public String numeroCC;

    @Column(name = "numero_sns", unique = true)
    public Long numeroSNS;
    
    @Column(name = "nome", nullable = false)
    public String nome;
    
    @Column(name = "sexo", nullable = false)
    @Enumerated(EnumType.STRING)
    public Sexo sexo;
    
    @Column(name = "email", nullable = false, unique = true)
    public String email;
    
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;
    
    @Column(name = "contacto", nullable = false)
    public Integer contacto;
    
    @Column(name = "contacto_emergencia", nullable = false)
    public Integer contactoEmergencia;

    @Column(name = "data_nascimento", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy")
    public LocalDate dataNascimento;
    
    @Column(name = "data_criacao", nullable = false)
    public LocalDateTime dataCriacao;
    
    @Column(name = "data_ultima_atividade")
    public LocalDateTime dataUltimaAtividade;
    
    @Column(name = "esta_ativo")
    public Boolean ativo;

    @Column(name = "codigo_verificacao")
    private String codigoVerificacao;

    @Column(name = "codigo_expira_em")
    private LocalDateTime codigoExpiraEm;

    public Utilizador(RegisterDTO data, String password) {
        this(
            null, 
            data.role(), 
            data.numeroMecanografico(),
            data.numeroCC(), 
            data.numeroSNS(),
            data.nome(),
            data.sexo(),
            data.email(),
            password,
            data.contacto(),
            data.contactoEmergencia(),
            data.dataNascimento(), 
            LocalDateTime.now(),
            LocalDateTime.now(),
            false,
            null,
            null
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRole()));
        
        if (role == Role.ENFERMEIRO_CHEFE) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ENFERMEIRO"));
        }
        
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
