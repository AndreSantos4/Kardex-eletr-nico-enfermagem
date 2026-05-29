package pt.ipcb.kardex.kardex_eletronico.dto.shift.atribuicao;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.LimitedTurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;

public record AtribuicaoUtenteDTO(
        @JsonProperty("utente") UtenteDTO utente,
        @JsonProperty("enfermeiro") LimitedFuncionarioDTO enfermeiro,
        @JsonProperty("turno") LimitedTurnoDTO turno
) {
}
