package pt.ipcb.kardex.kardex_eletronico.dto.plan;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrioridadeDiagnostico;

import java.time.LocalDate;

public record NursingDiagnosticDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("diagnostico") String diagnostico,
        @JsonProperty("prioridade") PrioridadeDiagnostico prioridade,
        @JsonProperty("dataCriacao") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataCriacao
){
}