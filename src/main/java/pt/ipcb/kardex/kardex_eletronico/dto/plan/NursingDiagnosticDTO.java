package pt.ipcb.kardex.kardex_eletronico.dto.plan;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrioridadeDiagnostico;

public record NursingDiagnosticDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("diagnostico") String diagnostico,
    @JsonProperty("prioridade") PrioridadeDiagnostico prioridade
){}