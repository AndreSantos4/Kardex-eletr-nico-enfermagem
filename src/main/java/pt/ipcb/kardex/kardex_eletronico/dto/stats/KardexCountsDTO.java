package pt.ipcb.kardex.kardex_eletronico.dto.stats;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KardexCountsDTO(
    @JsonProperty("activeUsers") long activeUsers,
    @JsonProperty("hospitalizedPatients") long hospitalizedPatients,
    @JsonProperty("openSessions") long openSessions,
    @JsonProperty("medicationsCatalog") long medicationsCatalog
) {

}
