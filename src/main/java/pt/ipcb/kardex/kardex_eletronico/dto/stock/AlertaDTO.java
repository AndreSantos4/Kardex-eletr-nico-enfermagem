package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AlertaDTO(
    @JsonProperty("id") int id,
    @JsonProperty("nome") String nome,
    @JsonProperty("descricao") String descricao
) {

}
