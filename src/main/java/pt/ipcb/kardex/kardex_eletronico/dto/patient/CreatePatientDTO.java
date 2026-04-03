package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Alergia;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

public record CreatePatientDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("dataNascimento") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataNascimento,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("numeroSNS") long numeroSNS,
    @JsonProperty("alergias") Alergia[] alergias,
    @JsonProperty("flagsRisco") FlagRisco[] flagsRisco
) {

}
