package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;

import java.time.LocalDateTime;

public record LimitedTurnoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("tipo") TipoTurno tipo,
        @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime inicio,
        @JsonProperty("fim") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime fim,
        @JsonProperty("observacoes") String observacoes
) {
}
