package pt.ipcb.kardex.kardex_eletronico.dto.process;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateProcessDTO(
    @JsonProperty("diagnosticoPrincipal") String diagnosticoPrincipal
) {

}
