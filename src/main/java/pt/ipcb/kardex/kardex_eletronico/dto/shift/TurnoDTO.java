package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;

public record TurnoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("tipo") TipoTurno tipo,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime inicio,
    @JsonProperty("fim") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime fim,
    @JsonProperty("IdEnfermeiros") List<Long> IdEnfermeiros,
    @JsonProperty("observacoes") String observacoes
) {
    
}
