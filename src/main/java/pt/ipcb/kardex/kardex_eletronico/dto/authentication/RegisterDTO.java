package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;

public record RegisterDTO(
    @JsonProperty("numeroMecanografico") Long numeroMecanografico, 
    @JsonProperty("role") Role role,
    @JsonProperty("email") String email,
    @JsonProperty("nome") String nome,
    @JsonProperty("sexo") char sexo,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia) {
}
