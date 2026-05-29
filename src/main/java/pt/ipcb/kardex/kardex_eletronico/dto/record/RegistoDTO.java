package pt.ipcb.kardex.kardex_eletronico.dto.record;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.NivelRegisto;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegisto;

import java.time.LocalDateTime;

public record RegistoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("utilizador") UtilizadorDTO utilizador,
        @JsonProperty("nivel") NivelRegisto nivelRegisto,
        @JsonProperty("tipo") TipoRegisto tipoRegisto,
        @JsonProperty("mensagem") String mensagem,
        @JsonProperty("detalhes") String detalhes,
        @JsonProperty("ip") String ip,
        @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy/HH:mm:ss") LocalDateTime stamp
) {
}
