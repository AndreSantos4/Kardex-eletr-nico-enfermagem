package pt.ipcb.kardex.kardex_eletronico.dto.plan;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FrequenciaIntervencao;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.IntervencaoDiagnostico;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrioridadeIntervencao;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoIntervencao;

import java.time.LocalDateTime;

public record CreateInterventionDTO(
        @JsonProperty("diagnostico") IntervencaoDiagnostico diagnostico,
        @JsonProperty("intervencao") TipoIntervencao intervencao,
        @JsonProperty("frequencia") FrequenciaIntervencao frequencia,
        @JsonProperty("prioridade") PrioridadeIntervencao prioridade,
        @JsonProperty("horarioPrevisto") String horarioPrevisto,
        @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime data,
        @JsonProperty("objetivo") String objetivo
) {
}
