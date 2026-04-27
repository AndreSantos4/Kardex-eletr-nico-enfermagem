package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Periodo;

public record FrequenciaDTO (
    @JsonProperty("frequencia") int frequencia,
    @JsonProperty("periodo") Periodo periodo,
    @JsonProperty("horaInferior") int horaInferior,
    @JsonProperty("horaSuperior") int horaSuperior
) {
    
}