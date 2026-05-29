package pt.ipcb.kardex.kardex_eletronico.dto.prescription.administration;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MedicValidationDTO(
        @JsonProperty("idMedico") Long idMedico
) {
}
