package pt.ipcb.kardex.kardex_eletronico.dto.process;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;

public record ProcessoClinicoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("utente") UtenteDTO utente,
    @JsonProperty("diagnosticoPrincipal") String diagnosticoPrincipal,
    @JsonProperty("cama") CamaDTO cama,
    @JsonProperty("dataEntrada") LocalDate dataEntrada,
    @JsonProperty("dataSaida") LocalDate dataSaida,
    @JsonProperty("alta") Boolean alta,
    @JsonProperty("servico") ServicoDTO servico
) {

}
