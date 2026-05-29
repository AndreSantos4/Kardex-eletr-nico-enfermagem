package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;

import java.math.BigDecimal;

public record MedicamentoRankingDTO(
        String nome,
        Long totalAdministracoes,
        BigDecimal quantidadeGasta,
        UnidadeMedida unidadeMedida
) {}