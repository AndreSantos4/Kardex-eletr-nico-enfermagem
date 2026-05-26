package pt.ipcb.kardex.kardex_eletronico.dto.shift.atribuicao;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.LimitedTurnoDTO;

public record AtribuicaoUtenteDTO(
        @JsonProperty("utente") UtenteDTO utente,
        @JsonProperty("turno") LimitedTurnoDTO turno
) {
}
