package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;

public record CreateShiftDTO(
    @JsonProperty("tipo") TipoTurno tipo,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate data,
    @JsonProperty("IdEnfermeiros") List<Long> IdEnfermeiros,
    @JsonProperty("observacoes") String observacoes
) {

}
