package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreatePrescriptionDTO(
    @JsonProperty("idMedicamento") Long idMedicamento,
    @JsonProperty("sos") boolean sos,
    @JsonProperty("motivo") String motivo,
    @JsonProperty("dataInicio") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataInicio,
    @JsonProperty("dataFim") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataFim,
    @JsonProperty("idDose") Long idDose,
    @JsonProperty("altoRisco") boolean altoRisco,
    @JsonProperty("frequencia") FrequenciaDTO frequencia
) {

}
