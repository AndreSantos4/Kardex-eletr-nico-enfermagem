package pt.ipcb.kardex.kardex_eletronico.dto.patient;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisterVitalSignsDTO(
    @JsonProperty("tensaoArteriaDistolica") int tensaoArteriaDistolica,
    @JsonProperty("tensaoArteriaSistolica") int tensaoArteriaSistolica,
    @JsonProperty("frequenciaCardiaca") int frequenciaCardiaca,
    @JsonProperty("temperatura") int temperatura,
    @JsonProperty("spo2") int spo2,
    @JsonProperty("dor") short dor,
    @JsonProperty("glicemia") int glicemia,
    @JsonProperty("observacoes") String observacoes,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime data
) {

}
