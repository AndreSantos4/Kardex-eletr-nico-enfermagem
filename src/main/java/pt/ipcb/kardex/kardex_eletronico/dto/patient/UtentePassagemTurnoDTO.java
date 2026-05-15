package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.AdministracoesDTO;

import java.util.List;

public record UtentePassagemTurnoDTO(
        @JsonProperty("utente") LimitedUtenteDTO utente,
        @JsonProperty("sinaisMedidos") boolean sinaisMedidos,
        @JsonProperty("administracoes") AdministracoesDTO administracoes,
        @JsonProperty("incidentes") List<IncidenteDTO> incidentes
) {
}
