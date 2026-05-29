package pt.ipcb.kardex.kardex_eletronico.dto.process;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;

import java.time.LocalDateTime;

public record LimitedProcessoClinicoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("utenteId") Long utenteId,
        @JsonProperty("medicoResponsavel") LimitedFuncionarioDTO medicoResponsavel,
        @JsonProperty("diagnosticoPrincipal") String diagnosticoPrincipal,
        @JsonProperty("motivoInternamento") String motivoInternamento,
        @JsonProperty("cama") CamaDTO cama,
        @JsonProperty("dataEntrada") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataEntrada,
        @JsonProperty("dataSaida") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataSaida,
        @JsonProperty("alta") Boolean alta
) {
}
