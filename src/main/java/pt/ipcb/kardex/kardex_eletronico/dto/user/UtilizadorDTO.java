package pt.ipcb.kardex.kardex_eletronico.dto.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

public record UtilizadorDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("numeroMecanografico") Long numeroMecanografico, 
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("numeroSNS") Long numeroSNS,
    @JsonProperty("role") Role role,
    @JsonProperty("email") String email,
    @JsonProperty("nome") String nome,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia,
    @JsonProperty("dataNascimento") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataNascimento,
    @JsonProperty("dataCriacao") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataCriacao,
    @JsonProperty("dataUltimaAtividade") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataUltimaAtividade,
    @JsonProperty("ativo") boolean ativo
) {
    
}
