package pt.ipcb.kardex.kardex_eletronico.dto.process;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CamaDTO(
    @JsonProperty("id") String id,
    @JsonProperty("ocupada") Boolean ocupada
) {

}
