package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UtenteDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("numeroSNS") int numeroSNS,
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("nome") String nome,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia,
    @JsonProperty("alergias") List<AlergiaDTO> alergias,
    @JsonProperty("flags") List<FlagRisco> flagsRisco,
    @JsonProperty("processo") ProcessoClinicoDTO processo
) {

}
