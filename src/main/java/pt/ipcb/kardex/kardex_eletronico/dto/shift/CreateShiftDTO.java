package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateShiftDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime inicio,
    @JsonProperty("fim") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime fim
) {

}
