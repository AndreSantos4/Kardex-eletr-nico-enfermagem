package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateAdministrationDTO(
    @JsonProperty("observacoes") String observacoes,
    @JsonProperty("foi_administrado") Boolean administrado
) {

}
