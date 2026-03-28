package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record MedicamentoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("nome") String nome,
    @JsonProperty("principioAtivo") String principioAtivo,
    @JsonProperty("formaFarmaceutica") String formaFarmaceutica,
    @JsonProperty("quantidade") Long quantidade,
    @JsonProperty("unidadeMedida") UnidadeMedida unidade,
    @JsonProperty("dataValidade") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dataValidade,
    @JsonProperty("viasAdministracao") List<ViaAdministracaoDTO> viasAdministracao,
    @JsonProperty("alertas") List<AlertaDTO> alertas,
    @JsonProperty("alergiasIncompativeis") List<AlergiaDTO> alergiaIncompativeis
) {

}
