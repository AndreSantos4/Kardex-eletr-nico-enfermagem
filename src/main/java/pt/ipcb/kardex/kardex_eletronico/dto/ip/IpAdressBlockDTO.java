package pt.ipcb.kardex.kardex_eletronico.dto.ip;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IpAdressBlockDTO(
    @JsonProperty("ip") String enderecoIP
) {

}
