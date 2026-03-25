package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

@Mapper(componentModel = "spring")
public interface TurnoMapper {
    TurnoDTO toDTO(Turno turno);

    Turno toEntity(TurnoDTO dto);

    List<TurnoDTO> toDTOList(List<Turno> turnos);
}
