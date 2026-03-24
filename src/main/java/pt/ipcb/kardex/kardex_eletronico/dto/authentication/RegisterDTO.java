package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

public record RegisterDTO(
    @JsonProperty("numeroMecanografico") Long numeroMecanografico, 
    @JsonProperty("numeroSNS") Long numeroSNS,
    @JsonProperty("role") Role role,
    @JsonProperty("email") String email,
    @JsonProperty("nome") String nome,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia) {
}
