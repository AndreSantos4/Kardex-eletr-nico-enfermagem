package pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoCateter;

public record CreateCateterDTO(    
    @JsonProperty("tipo") TipoCateter tipo,
    @JsonProperty("calibre") String calibre,
    @JsonProperty("dataInsercao") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataInsercao,
    @JsonProperty("dataSubstituicao") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime dataSubstituicao,
    @JsonProperty("localInsercao") String localInsercao,
    @JsonProperty("observacoes") String observacoes
) {

}
