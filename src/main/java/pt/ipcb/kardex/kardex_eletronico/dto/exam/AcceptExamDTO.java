package pt.ipcb.kardex.kardex_eletronico.dto.exam;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public record AcceptExamDTO(
        @JsonProperty("dataPretendida") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataPretendida
) {
}
