package pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.DosagemDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;

public record ContencaoDTO(
    @JsonProperty("medicamento") MedicamentoDTO medicamento,
    @JsonProperty("justificao") String justificacao,
    @JsonProperty("dose") DosagemDTO dose,
    @JsonProperty("duracao") String duracao,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm") LocalDateTime data 
) {

}
