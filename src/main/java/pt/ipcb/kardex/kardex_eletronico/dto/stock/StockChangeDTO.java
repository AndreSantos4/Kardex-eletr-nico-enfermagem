package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StockChangeDTO(
        @JsonProperty("idMedicamento") Long idMedicamento,
        @JsonProperty("quantidade") BigDecimal quantidade,
        @JsonProperty("validade") LocalDate validade
) {
}
