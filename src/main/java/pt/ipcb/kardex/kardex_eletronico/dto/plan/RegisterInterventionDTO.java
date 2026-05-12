package pt.ipcb.kardex.kardex_eletronico.dto.plan;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record RegisterInterventionDTO(
        @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm") LocalDateTime data,
        @JsonProperty("observacoes") String observacoes
) {
}
