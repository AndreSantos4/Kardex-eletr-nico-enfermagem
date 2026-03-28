package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.GravidadeIncidente;

public record CreateIncidentDTO(
    @JsonProperty("descricao") String descricao,
    @JsonProperty("gravidade") GravidadeIncidente gravidade,
    @JsonProperty("medidasTomadas") String medidasTomadas
) {

}
