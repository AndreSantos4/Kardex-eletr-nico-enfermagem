package pt.ipcb.kardex.kardex_eletronico.dto.shift.atribuicao;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateAtribuicaoUtenteDTO(
        @JsonProperty("idUtente") Long idUtente,
        @JsonProperty("idEnfermeiro") Long idEnfermeiro
) {
}
