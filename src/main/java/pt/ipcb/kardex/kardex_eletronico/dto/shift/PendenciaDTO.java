package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.LimitedUtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;

public record PendenciaDTO(
        @JsonProperty("utente") LimitedUtenteDTO utente,
        @JsonProperty("tipo") TipoPendencia tipo,
        @JsonProperty("descricao") String descricao,
        @JsonProperty("executada") boolean executada
) {
}
