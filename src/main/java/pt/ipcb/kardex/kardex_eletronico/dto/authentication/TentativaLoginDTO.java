package pt.ipcb.kardex.kardex_eletronico.dto.authentication;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record TentativaLoginDTO(
    @JsonProperty("id") Long id,
    @JsonProperty("numeroMecanografico") Long numeroMecanografico,
    @JsonProperty("enderecoIP") String enderecoIP,
    @JsonProperty("sucesso") boolean sucesso,
    @JsonProperty("tentouEm")  @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime tentouEm,
    @JsonProperty("motivoFalha") String motivoFalha
) {

}
