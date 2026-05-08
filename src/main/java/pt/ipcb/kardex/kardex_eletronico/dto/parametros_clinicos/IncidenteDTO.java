package pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.GravidadeIncidente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoCateter;

public record IncidenteDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("tipo") TipoCateter tipo,
    @JsonProperty("descricao") String descricao,
    @JsonProperty("funcionario") FuncionarioDTO funcionario,
    @JsonProperty("gravidade") GravidadeIncidente gravidade,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm") LocalDateTime data
) {

}
