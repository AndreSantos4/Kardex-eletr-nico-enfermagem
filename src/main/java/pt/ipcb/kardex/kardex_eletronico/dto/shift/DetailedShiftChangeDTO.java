package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;

public record DetailedShiftChangeDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("turno") TurnoDTO turno,
    @JsonProperty("proximoTurno") LimitedTurnoDTO proximoTurno,
    @JsonProperty("dadosTurnoUtentes") List<PendenciaDTO> dadosTurnoUtente,
    @JsonProperty("validador") LimitedFuncionarioDTO validador,
    @JsonProperty("dataValidacao") LocalDateTime dataValidacao,
    @JsonProperty("notaValidacao") String notaValidacao
) {
}