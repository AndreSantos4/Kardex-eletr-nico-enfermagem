package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PatientKardexDTO(
    @JsonProperty("dados") UtenteDTO dados
) {

}
