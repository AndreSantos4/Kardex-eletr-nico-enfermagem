package pt.ipcb.kardex.kardex_eletronico.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrioridadeDiagnostico;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "diagnostico_enfermagem")
public class DiagnosticoEnfermagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JoinColumn(name = "id_plano_cuidados", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public PlanoCuidados planoCuidados;

    @Column(name = "diagnostico", nullable = false)
    public String diagnostico;

    @Column(name = "prioridade")
    public PrioridadeDiagnostico prioridade;

    @Column(name = "data_criacao", nullable = false)
    public LocalDate dataCriacao = LocalDate.now();
}