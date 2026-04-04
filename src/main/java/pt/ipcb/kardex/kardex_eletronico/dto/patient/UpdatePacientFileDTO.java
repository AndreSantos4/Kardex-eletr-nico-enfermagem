package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

public record UpdatePacientFileDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("dataNascimento") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataNascimento,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("numeroSNS") long numeroSNS,
    @JsonProperty("camaId") String camaId,
    @JsonProperty("medicoId") long medicoId,
    @JsonProperty("flagsRisco") List<FlagRisco> flagsRisco,
    @JsonProperty("alergias") List<AlergiaDTO> alergias
) {

}
