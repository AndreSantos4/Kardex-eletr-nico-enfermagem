package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateShiftChangeDTO(
        @JsonProperty("idTurno") Long idTurno,
        @JsonProperty("idTurnoSeguinte") Long idTurnoSeguinte,
        @JsonProperty("observacoes") String observacoes
) {
}
