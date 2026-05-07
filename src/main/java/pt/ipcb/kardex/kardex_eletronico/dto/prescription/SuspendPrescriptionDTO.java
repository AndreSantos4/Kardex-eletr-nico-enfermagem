package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.MotivoClinico;

public record SuspendPrescriptionDTO(
    @JsonProperty("definitiva") boolean definitiva,
    @JsonProperty("dataRetorno") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataRetorno,
    @JsonProperty("motivo") MotivoClinico motivo,
    @JsonProperty("observacoes") String observacoes
){}