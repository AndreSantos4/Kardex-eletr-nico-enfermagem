package pt.ipcb.kardex.kardex_eletronico.dto.prescription;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;

public record AdministracaoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("prescricao") PrescricaoDTO prescricao,
    @JsonProperty("funcionario") FuncionarioDTO funcionario,
    @JsonProperty("turno") TurnoDTO turno,
    @JsonProperty("observacoes") String observacoes,
    @JsonProperty("data_administrado") LocalDateTime data
    ) {
    
}
