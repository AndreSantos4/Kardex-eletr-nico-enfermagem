package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.GravidadeIncidente;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "incidente_clinico")
public class IncidenteClinico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @Column(name = "descricao", nullable = false)
    public String descricao;
    
    @Column(name = "gravidade_incidente", nullable = false)
    public GravidadeIncidente gravidade;
    
    @Column(name = "medidas_tomadas")
    public String medidasTomadas;
    
    @Column(name = "data", nullable = false)
    public LocalDateTime data;
}
