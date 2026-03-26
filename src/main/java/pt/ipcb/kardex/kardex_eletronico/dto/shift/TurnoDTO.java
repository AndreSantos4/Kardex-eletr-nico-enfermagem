package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.IncidenteDTO;

public record TurnoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("nome") String nome,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate inicio,
    @JsonProperty("incidentes") IncidenteDTO[] incidentes
) {
    
}
