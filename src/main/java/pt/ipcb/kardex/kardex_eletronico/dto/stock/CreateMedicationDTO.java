package pt.ipcb.kardex.kardex_eletronico.dto.stock;

import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ClasseFarmacologica;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FormaFarmaceutica;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ViaAdministracao;

public record CreateMedicationDTO(
    @JsonProperty("nome") String nome,
    @JsonProperty("principioAtivo") String principioAtivo,
    @JsonProperty("formaFarmaceutica") FormaFarmaceutica formaFarmaceutica,
    @JsonProperty("classeFarmacologica") ClasseFarmacologica classeFarmacologica,
    @JsonProperty("dosagens") DosagemDTO[] dosagens,
    @JsonProperty("dosagemMaxDiaria") DosagemDTO dosagemMaxDiaria, 
    @JsonProperty("quantidade") Long quantidade,
    @JsonProperty("unidadeMedida") UnidadeMedida unidadeMedida,
    @JsonProperty("viaAdministracao") ViaAdministracao viaAdministracao,
    @JsonProperty("altoRisco") boolean altoRisco
) {

}
