package pt.ipcb.kardex.kardex_eletronico.dto.worker;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;

public record ShiftSummaryDTO(
    @JsonProperty("tipo") TipoTurno tipo,
    @JsonProperty("nAdministracoes") int nAdministracoes,
    @JsonProperty("nIncidentes") int nIncidentes,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate data
) {

}
