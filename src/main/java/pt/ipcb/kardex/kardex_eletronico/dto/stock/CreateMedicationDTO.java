package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateMedicationDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("principioAtivo") String principioAtivo,
    @JsonProperty("formaFarmaceutica") String formaFarmaceutica,
    @JsonProperty("quantidade") Long quantidade,
    @JsonProperty("unidadeMedida") UnidadeMedida unidade,
    @JsonProperty("dataValidade") LocalDate dataValidade
) {

}
