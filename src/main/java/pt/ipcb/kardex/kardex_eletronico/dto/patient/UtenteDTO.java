package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UtenteDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("numeroSNS") int numeroSNS,
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("primerioNome") String primeiroNome,
    @JsonProperty("apelido") String apelido,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia,
    @JsonProperty("estado") EstadoUtente estado,
    @JsonProperty("alergias") List<AlergiaDTO> alergias,
    @JsonProperty("flags") List<FlagRisco> flagsRiscos
) {

}
