package pt.ipcb.kardex.kardex_eletronico.dto.worker;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record ShiftSummaryDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("nAdministracoes") int nAdministracoes,
    @JsonProperty("nIncidentes") int nIncidentes,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate data
) {

}
