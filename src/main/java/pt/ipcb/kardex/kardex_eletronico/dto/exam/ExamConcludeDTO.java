package pt.ipcb.kardex.kardex_eletronico.dto.exam;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public record ExamConcludeDTO(
        @JsonProperty("resultado") String resultado,
        @JsonProperty("atencao") boolean atencao,
        @JsonProperty("atencaoDescricao") String atencaoDescricao,
        @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate data
) {
}
