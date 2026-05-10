package pt.ipcb.kardex.kardex_eletronico.model.entity;

import java.time.LocalDate;

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
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.MotivoClinico;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "suspensao_clinica")
public class SuspensaoClinica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "data_retorno")
    public LocalDate dataRetorno;

    @Column(name = "motivo", nullable = false)
    @Enumerated(EnumType.STRING)
    public MotivoClinico motivo;

    @Column(name = "observacoes", nullable = false)
    public String observacoes;
}
