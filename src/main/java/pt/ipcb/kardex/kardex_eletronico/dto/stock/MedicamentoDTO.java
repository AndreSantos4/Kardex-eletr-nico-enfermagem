package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ClasseFarmacologica;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ViaAdministracao;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record MedicamentoDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("nome") String nome,
    @JsonProperty("principioAtivo") String principioAtivo,
    @JsonProperty("formaFarmaceutica") String formaFarmaceutica,
    @JsonProperty("classeFarmacologica") ClasseFarmacologica classeFarmacologica,
    @JsonProperty("dosagens") DosagemDTO[] dosagens,
    @JsonProperty("dosagemMaxDiaria") DosagemDTO dosagemMaxDiaria, 
    @JsonProperty("quantidade") Long quantidade,
    @JsonProperty("unidadeMedida") UnidadeMedida unidadeMedida,
    @JsonProperty("altoRisco") boolean altoRisco,
    @JsonProperty("active") boolean active,
    @JsonProperty("viaAdministracao") ViaAdministracao viaAdministracao,
    @JsonProperty("alergiasIncompativeis") List<AlergiaDTO> alergiasIncompativeis
) {

}
