package pt.ipcb.kardex.kardex_eletronico.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "lote_medicamento")
public class LoteMedicamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JoinColumn(name = "id_medicamento", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    public Medicamento medicamento;

    @Column(name = "quantidade",  nullable = false)
    public BigDecimal quantidade = BigDecimal.ZERO;

    @Column(name = "validade", nullable = false)
    public LocalDate validade = LocalDate.now().plusDays(30);
}
