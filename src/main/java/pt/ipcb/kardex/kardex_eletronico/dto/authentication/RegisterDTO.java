package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;

public record RegisterDTO(
    @JsonProperty("numeroMecanografico") Long numeroMecanografico, 
    @JsonProperty("role") Role role) {
    
}
