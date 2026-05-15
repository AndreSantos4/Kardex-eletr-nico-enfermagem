package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record StockChangeDTO(
        @JsonProperty("quantidade") BigDecimal quantidade
) {
}
