package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

@Mapper(componentModel = "spring")
public interface TurnoMapper {
    TurnoDTO toDTO(Turno turno);

    Turno toEntity(TurnoDTO dto);

    Turno fromCreate(CreateShiftDTO data);

    List<TurnoDTO> toDTOList(List<Turno> turnos);
}
