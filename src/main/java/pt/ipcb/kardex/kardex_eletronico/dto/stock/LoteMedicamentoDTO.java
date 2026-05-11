package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteMedicamentoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("quantidade") BigDecimal quantidade,
        @JsonProperty("validade") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate validade
) {
}
