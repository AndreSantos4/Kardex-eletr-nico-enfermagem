package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StrangeAttempDTO(
    @JsonProperty("enderecoIP") String enderecoIP,
    @JsonProperty("numeroMecanografico") Long numeroMecanografico,
    @JsonProperty("numeroTentativas") Long numeroTentativas
) {

}
