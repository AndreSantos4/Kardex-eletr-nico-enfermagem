package pt.ipcb.kardex.kardex_eletronico.dto.shift;

import com.fasterxml.jackson.annotation.JsonProperty;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtentePassagemTurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.AdministracoesDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.SinalVitalDTO;

import java.util.List;

public record PassagemTurnoDTO(
        @JsonProperty("turno") LimitedTurnoDTO turno,
        @JsonProperty("proximoTurno") LimitedTurnoDTO proximoTurno,
        @JsonProperty("dadosTurnoUtentes") List<UtentePassagemTurnoDTO> dadosTurnoUtente,
        @JsonProperty("observacoesEnfermeiro") String observacoesEnfermeiro
) {
}
