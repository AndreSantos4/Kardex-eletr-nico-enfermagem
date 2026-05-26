package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.DetailedShiftChangeDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.LimitedTurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.PendenciaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PassagemTurno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Pendencia;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

@Mapper(componentModel = "spring")
public interface TurnoMapper {
    TurnoDTO toDTO(Turno turno);

    LimitedTurnoDTO toLimitedDTO(Turno turno);

    Turno toEntity(TurnoDTO dto);

    Turno fromCreate(CreateShiftDTO data);

    List<TurnoDTO> toDTOList(List<Turno> turnos);

    List<PendenciaDTO> toIssuesDTOList(List<Pendencia> issues);

    DetailedShiftChangeDTO toDetailsChangeDTO(PassagemTurno data, List<Pendencia> dadosTurnoUtente);
}
