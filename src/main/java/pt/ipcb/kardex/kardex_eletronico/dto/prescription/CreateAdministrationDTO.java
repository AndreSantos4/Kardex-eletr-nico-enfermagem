package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateAdministrationDTO(
    @JsonProperty("observacoes") String observacoes,
    @JsonProperty("foi_administrado") Boolean administrado,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime data
) {

}
