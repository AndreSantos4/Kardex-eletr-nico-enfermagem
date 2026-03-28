package pt.ipcb.kardex.kardex_eletronico.dto.session;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;

public record SessaoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("utilizador") UtilizadorDTO utilizador,
    @JsonProperty("enderecoIp") String enderecoIP,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime inicio
) {

}
