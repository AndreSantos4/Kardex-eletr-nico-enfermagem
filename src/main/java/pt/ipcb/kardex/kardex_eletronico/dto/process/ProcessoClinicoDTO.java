package pt.ipcb.kardex.kardex_eletronico.dto.process;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;

public record ProcessoClinicoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("utenteId") Long utenteId,
    @JsonProperty("medicoResponsavel") FuncionarioDTO medicoResponsavel,
    @JsonProperty("diagnosticoPrincipal") String diagnosticoPrincipal,
    @JsonProperty("motivoInternamento") String motivoInternamento,
    @JsonProperty("cama") CamaDTO cama,
    @JsonProperty("dataEntrada") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataEntrada,
    @JsonProperty("dataSaida") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataSaida,
    @JsonProperty("alta") Boolean alta,
    @JsonProperty("servico") ServicoDTO servico,
    @JsonProperty("sinaisVitais") List<SinalVitalDTO> sinaisVitais
) {

}
