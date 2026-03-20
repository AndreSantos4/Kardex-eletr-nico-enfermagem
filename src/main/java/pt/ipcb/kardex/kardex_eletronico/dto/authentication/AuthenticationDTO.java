package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthenticationDTO(
    @JsonProperty("numeroMecanografico") String numeroMecanografico, 
    @JsonProperty("password") String password) {

}
