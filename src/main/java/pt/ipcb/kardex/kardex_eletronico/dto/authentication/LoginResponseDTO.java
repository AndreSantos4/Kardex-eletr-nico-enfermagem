package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginResponseDTO(@JsonProperty("token") String token) {

}
