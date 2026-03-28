package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.GravidadeIncidente;

public record IncidenteDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("descricao") String descricao,
    @JsonProperty("funcionario") FuncionarioDTO funcionario,
    @JsonProperty("gravidade") GravidadeIncidente gravidade,
    @JsonProperty("medidasTomadas") String medidasTomadas,
    @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate data
) {

}
