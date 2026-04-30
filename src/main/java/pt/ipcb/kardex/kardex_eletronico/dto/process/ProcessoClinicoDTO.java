package pt.ipcb.kardex.kardex_eletronico.dto.process;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.dto.prescription.PrescricaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;

public record ProcessoClinicoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("utenteId") Long utenteId,
    @JsonProperty("medicoResponsavel") FuncionarioDTO medicoResponsavel,
    @JsonProperty("diagnosticoPrincipal") String diagnosticoPrincipal,
    @JsonProperty("motivoInternamento") String motivoInternamento,
    @JsonProperty("cama") CamaDTO cama,
    @JsonProperty("dataEntrada") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataEntrada,
    @JsonProperty("dataSaida") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataSaida,
    @JsonProperty("alta") Boolean alta,
    @JsonProperty("servico") ServicoDTO servico,
    @JsonProperty("sinaisVitais") List<SinalVitalDTO> sinaisVitais,
    @JsonProperty("prescricoes") List<PrescricaoDTO> prescricoes
) {

}
