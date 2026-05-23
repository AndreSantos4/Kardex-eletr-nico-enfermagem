package pt.ipcb.kardex.kardex_eletronico.dto.note;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.LimitedFuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoNotaEvolucaoClinica;

import java.time.LocalDateTime;

public record NotaClinicaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("medico") LimitedFuncionarioDTO medico,
        @JsonProperty("tipo")TipoNotaEvolucaoClinica tipo,
        @JsonProperty("justificacaoClinica") String justificacaoClinica,
        @JsonProperty("data") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm") LocalDateTime data
) {
}
