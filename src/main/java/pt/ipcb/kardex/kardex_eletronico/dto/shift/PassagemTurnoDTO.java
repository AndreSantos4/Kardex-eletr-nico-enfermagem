package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PassagemTurnoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("turno") LimitedTurnoDTO turno,
        @JsonProperty("proximoTurno") LimitedTurnoDTO proximoTurno,
        @JsonProperty("dadosTurnoUtentes") List<PendenciaDTO> dadosTurnoUtente
) {
}
