package pt.ipcb.kardex.kardex_eletronico.dto.exam;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Urgencia;

import java.time.LocalDate;

public record CreateExamDTO(
        @JsonProperty("tipo") TipoExame tipo,
        @JsonProperty("urgencia") Urgencia urgencia,
        @JsonProperty("dataPretendida") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataPretendida,
        @JsonProperty("indicacao") String indicacaoClinica,
        @JsonProperty("observacoes") String observacoesLaboratorio
) {
}
