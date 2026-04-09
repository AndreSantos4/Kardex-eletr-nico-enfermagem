package pt.ipcb.kardex.kardex_eletronico.dto.process;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record DischargePatientDTO(
    @JsonProperty("notasAlta") String notasAlta,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime data
) {

}