package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;

public record PrescricaoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("medicamento") Medicamento medicamento,
    @JsonProperty("sos") Boolean sos,
    @JsonProperty("motivo") String motivo,
    @JsonProperty("ativa") Boolean ativa,
    @JsonProperty("inicio") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime dataInicio,
    @JsonProperty("fim") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss")  LocalDateTime dataFim,
    @JsonProperty("dose") int dose,
    @JsonProperty("duracaoDias") int duracaoDias
) {

}
