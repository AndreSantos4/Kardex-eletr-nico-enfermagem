package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;

import java.time.LocalDateTime;
import java.util.List;

public record PassagemTurnoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("turno") TurnoDTO turno,
        @JsonProperty("proximoTurno") LimitedTurnoDTO proximoTurno,
        @JsonProperty("dadosTurnoUtentes") List<PendenciaDTO> dadosTurnoUtente,
        @JsonProperty("validador") LimitedFuncionarioDTO validador,
        @JsonProperty("dataValidacao") LocalDateTime dataValidacao
) {
}
