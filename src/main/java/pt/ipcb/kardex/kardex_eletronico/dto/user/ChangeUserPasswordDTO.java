package pt.ipcb.kardex.kardex_eletronico.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChangeUserPasswordDTO(
    @JsonProperty("newPassword") String newPassword
) {

}
