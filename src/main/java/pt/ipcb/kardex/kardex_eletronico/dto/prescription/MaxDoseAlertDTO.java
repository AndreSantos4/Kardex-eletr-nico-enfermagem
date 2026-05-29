package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;

import java.math.BigDecimal;

public record MaxDoseAlertDTO(
        @JsonProperty("medicamento") MedicamentoDTO medicamento,
        @JsonProperty("maxDose") BigDecimal maxDose,
        @JsonProperty("dose") BigDecimal dose
) {
}
