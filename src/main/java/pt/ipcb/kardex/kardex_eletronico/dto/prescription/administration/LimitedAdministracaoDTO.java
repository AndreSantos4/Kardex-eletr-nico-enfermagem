package pt.ipcb.kardex.kardex_eletronico.dto.prescription.administration;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;

import java.time.LocalDateTime;

public record LimitedAdministracaoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("funcionario") LimitedFuncionarioDTO funcionario,
        @JsonProperty("observacoes") String observacoes,
        @JsonProperty("administrado") Boolean administrado,
        @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime data
) {
}
