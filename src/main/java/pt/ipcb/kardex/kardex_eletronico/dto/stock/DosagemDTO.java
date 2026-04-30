package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;

public record DosagemDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("dose") BigDecimal dose,
    @JsonProperty("unidadeMedida") UnidadeMedida unidadeMedida
) {}