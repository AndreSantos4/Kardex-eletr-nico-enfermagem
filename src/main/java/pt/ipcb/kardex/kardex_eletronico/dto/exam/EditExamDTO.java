package pt.ipcb.kardex.kardex_eletronico.dto.exam;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Urgencia;

import java.time.LocalDate;

public record EditExamDTO(
        @JsonProperty("urgencia") Urgencia urgencia,
        @JsonProperty("dataPretendida") @JsonFormat(pattern = "dd/MM/yyy") LocalDate dataPrentendida,
        @JsonProperty("indicacao") String indicacaoClinica
) {
}
