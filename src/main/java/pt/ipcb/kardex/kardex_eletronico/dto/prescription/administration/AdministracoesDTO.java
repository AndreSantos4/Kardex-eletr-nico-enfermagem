package pt.ipcb.kardex.kardex_eletronico.dto.prescription.administration;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AdministracoesDTO(
        @JsonProperty("administradas") List<AdministracaoDTO> administradas,
        @JsonProperty("naoAdministradas") List<AdministracaoDTO> naoAdministradas,
        @JsonProperty("sos") List<AdministracaoDTO> sos
) {
}
