package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;

public record CreateShiftDTO(
    @JsonProperty("tipo") TipoTurno tipo,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate data,
    @JsonProperty("inicio") @JsonFormat(pattern = "HH:mm") LocalTime horaInicio,
    @JsonProperty("fim") @JsonFormat(pattern = "HH:mm") LocalTime horaFim,
    @JsonProperty("IdEnfermeiros") List<Long> IdEnfermeiros,
    @JsonProperty("observacoes") String observacoes
) {

}
