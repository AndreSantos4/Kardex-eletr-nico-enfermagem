package pt.ipcb.kardex.kardex_eletronico.dto.record;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.process.LimitedProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegistoClinico;

import java.time.LocalDateTime;

public record RegistoClinicoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("timestamp") LocalDateTime timestamp,
        @JsonProperty("detalhes") String detalhes,
        @JsonProperty("funcionario") LimitedFuncionarioDTO funcionario,
        @JsonProperty("processo") LimitedProcessoClinicoDTO processo,
        @JsonProperty("tipo") TipoRegistoClinico tipo,
        @JsonProperty("detalhesNumericos") float detalhesNumericos
) {
}
