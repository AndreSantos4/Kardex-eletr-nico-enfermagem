package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

import java.time.LocalDate;
import java.util.List;

public record LimitedUtenteDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("numeroSNS") int numeroSNS,
        @JsonProperty("numeroCC") String numeroCC,
        @JsonProperty("nome") String nome,
        @JsonProperty("dataNascimento") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataNascimento,
        @JsonProperty("sexo") Sexo sexo,
        @JsonProperty("contacto") int contacto,
        @JsonProperty("contactoEmergencia") int contactoEmergencia,
        @JsonProperty("alergias") List<AlergiaDTO> alergias,
        @JsonProperty("flags") List<FlagRisco> flagsRisco
) {
}
