package pt.ipcb.kardex.kardex_eletronico.dto.worker;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.AtribuicaoUtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;

import java.util.List;

public record FuncionarioDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("dados") UtilizadorDTO dados,
    @JsonProperty("atribuicoes") List<AtribuicaoUtenteDTO> atribuicoes
) {

}
