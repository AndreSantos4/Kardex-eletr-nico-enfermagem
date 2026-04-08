package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AlergiaDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("nome") String nome
) {

}
