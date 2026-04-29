package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.stock.DosagemDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;

public record PrescricaoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("medicamento") MedicamentoDTO medicamento,
    @JsonProperty("sos") Boolean sos,
    @JsonProperty("motivo") String motivo,
    @JsonProperty("ativa") Boolean ativa,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy")  LocalDate dataInicio,
    @JsonProperty("fim") @JsonFormat(pattern = "dd/MM/yyyy")  LocalDate dataFim,
    @JsonProperty("dose") DosagemDTO dose,
    @JsonProperty("altoRisco") boolean altoRisco,
    @JsonProperty("frequencia") FrequenciaDTO frequencia
) {

}
