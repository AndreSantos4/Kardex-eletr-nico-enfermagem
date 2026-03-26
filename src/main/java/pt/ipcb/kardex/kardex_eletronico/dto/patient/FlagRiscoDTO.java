package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FlagRiscoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("nome") String nome,
    @JsonProperty("descricao") String descricao
) {

}
