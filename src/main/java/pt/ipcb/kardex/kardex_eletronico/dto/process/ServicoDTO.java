package pt.ipcb.kardex.kardex_eletronico.dto.process;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ServicoDTO(
    @JsonProperty("id") int id,
    @JsonProperty("nome") String nome,
    @JsonProperty("descricao") String descricao
) {
    
}
