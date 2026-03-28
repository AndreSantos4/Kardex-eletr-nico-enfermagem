package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreatePatientDTO(
    @JsonProperty("numeroSNS") int numeroSNS,
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("primeiroNome") String primeiroNome,
    @JsonProperty("apelido") String apelido,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia
) {

}
