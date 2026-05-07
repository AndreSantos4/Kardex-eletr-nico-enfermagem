package pt.ipcb.kardex.kardex_eletronico.dto.plan;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;

public record PlanoCuidadosDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("diagnosticos") List<NursingDiagnosticDTO> diagnosticos,
    @JsonProperty("versao") int versao,
    @JsonProperty("dataCriacao") LocalDate dataCriacao,
    @JsonProperty("autor") FuncionarioDTO autor,
    @JsonProperty("ativo") boolean ativo
) {}