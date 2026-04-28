package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Periodo;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "frequencia")
public class Frequencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @Column(name = "frequencia")
    public int frequencia;
    
    @Column(name = "periodo", nullable = false)
    @Enumerated(EnumType.STRING)
    public Periodo periodo;

    @Column(name = "intervaloMinHoras", nullable = false)
    public int intervaloMinHoras;
}