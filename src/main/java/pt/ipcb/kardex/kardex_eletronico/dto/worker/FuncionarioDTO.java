package pt.ipcb.kardex.kardex_eletronico.dto.worker;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;

public record FuncionarioDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("dados") UtilizadorDTO dados
) {

}
