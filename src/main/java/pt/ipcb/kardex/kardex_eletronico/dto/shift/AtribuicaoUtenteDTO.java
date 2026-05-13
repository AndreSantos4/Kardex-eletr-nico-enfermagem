package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;

public record AtribuicaoUtenteDTO(
        @JsonProperty("utente") UtenteDTO utente,
        @JsonProperty("turno") LimitedTurnoDTO turno
) {
}
