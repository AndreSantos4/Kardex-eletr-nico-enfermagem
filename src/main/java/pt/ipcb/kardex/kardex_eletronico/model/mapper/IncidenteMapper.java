package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateIncidentDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.IncidenteClinico;

@Mapper(componentModel = "spring")
public interface IncidenteMapper {
    IncidenteDTO toDTO(IncidenteClinico utilizador);

    IncidenteClinico toEntity(IncidenteDTO dto);

    IncidenteClinico fromCreate(CreateIncidentDTO dto);

    List<IncidenteDTO> toDTOList(List<IncidenteClinico> utilizadores);
}
