package pt.ipcb.kardex.kardex_eletronico.dto.stats;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KardexReportsDTO(
        @JsonProperty("administracoes") long nAdministracoes,
        @JsonProperty("nNaoAdministracoes") long nNaoAdministracoes,
        @JsonProperty("nIncidentesClinicos") long nIncidentesClinicos
) {
}
