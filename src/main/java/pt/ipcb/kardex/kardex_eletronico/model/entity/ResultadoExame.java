package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "resultado_exame")
public class ResultadoExame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "data", nullable = false)
    public LocalDateTime data = LocalDateTime.now();

    @Column(name = "atencao", nullable = false)
    public boolean atencao = false;

    @Column(name = "resultado", nullable = false)
    public String resultado;
}
