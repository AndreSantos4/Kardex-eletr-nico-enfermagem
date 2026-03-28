package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreatePrescriptionDTO(
    @JsonProperty("idMedicamento") Long idMedicamento,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataInicio,
    @JsonProperty("dose") int dose,
    @JsonProperty("duracaoDias") int duracaoDias
) {

}
