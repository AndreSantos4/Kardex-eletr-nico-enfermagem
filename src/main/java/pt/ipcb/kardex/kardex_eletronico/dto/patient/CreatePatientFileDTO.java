package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Sexo;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreatePatientFileDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("dataNascimento") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataNascimento,
    @JsonProperty("sexo") Sexo sexo,
    @JsonProperty("numeroCC") String numeroCC,
    @JsonProperty("numeroSNS") long numeroSNS,
    @JsonProperty("diagnosticoPrincipal")  String diagnosticoPrincipal,
    @JsonProperty("contacto") int contacto,
    @JsonProperty("contactoEmergencia") int contactoEmergencia,
    @JsonProperty("medicoId") Long medicoId,
    @JsonProperty("camaId") String camaId,
    @JsonProperty("alergias") List<CreateAlergyDTO> alergias,
    @JsonProperty("motivoInternamento") String motivoInternamento,
    @JsonProperty("flagsRisco") List<FlagRisco> flagsRisco
) {

    public CreatePatientFileDTO {
        if (camaId == null) camaId = "N/A";
        if (alergias == null) alergias = List.of();
        if (flagsRisco == null) flagsRisco = List.of();
    }
}
