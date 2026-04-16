package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateAlergyDTO(
    @JsonProperty("nome") String nome
) {

}
