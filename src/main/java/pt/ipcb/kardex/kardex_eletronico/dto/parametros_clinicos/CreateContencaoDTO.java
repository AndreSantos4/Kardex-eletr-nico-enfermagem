package pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateContencaoDTO(
    @JsonProperty("idMedicamento") Long idMedicamento,
    @JsonProperty("justificacao") String justificacao,
    @JsonProperty("idDose") Long idDose,
    @JsonProperty("duracao") String duracao,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm") LocalDateTime data 
) {

}
