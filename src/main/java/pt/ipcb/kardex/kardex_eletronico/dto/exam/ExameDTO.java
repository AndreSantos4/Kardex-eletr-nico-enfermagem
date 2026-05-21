package pt.ipcb.kardex.kardex_eletronico.dto.exam;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Urgencia;

public record ExameDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("medico") FuncionarioDTO medico,
        @JsonProperty("tipo") TipoExame tipo,
        @JsonProperty("urgencia") Urgencia urgencia,
        @JsonProperty("dataPedido") String dataPedido,
        @JsonProperty("dataPretendida") String dataPrentendida,
        @JsonProperty("indicacaoClinica") String indicacaoClinica,
        @JsonProperty("observacoesLaboratorio") String observacoesLaboratorio,
        @JsonProperty("estado") EstadoExame estado
) {
}
