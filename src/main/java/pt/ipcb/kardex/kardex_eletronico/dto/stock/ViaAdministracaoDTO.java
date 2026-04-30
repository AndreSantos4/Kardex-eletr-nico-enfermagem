package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ViaAdministracaoDTO(
    @JsonProperty("id") int id,
    @JsonProperty("nome") String nome
) {

}
