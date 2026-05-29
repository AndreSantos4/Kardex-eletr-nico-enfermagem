package pt.ipcb.kardex.kardex_eletronico.dto.shift.atribuicao;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AssignNursesDTO(
        @JsonProperty("atribuicoes") List<CreateAtribuicaoUtenteDTO> atribuicoes
) {
}
