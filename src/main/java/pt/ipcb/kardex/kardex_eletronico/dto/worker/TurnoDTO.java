package pt.ipcb.kardex.kardex_eletronico.dto.worker;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TurnoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("nome") String nome,
    @JsonProperty("inicio") LocalDate inicio,
    @JsonProperty("incidentes") IncidenteDTO[] incidentes
) {
    
}
