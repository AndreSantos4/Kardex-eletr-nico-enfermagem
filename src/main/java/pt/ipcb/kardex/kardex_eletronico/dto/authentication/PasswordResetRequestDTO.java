package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PasswordResetRequestDTO(
    @JsonProperty("numeroMecanografico") String numeroMecanografico
) {

}
