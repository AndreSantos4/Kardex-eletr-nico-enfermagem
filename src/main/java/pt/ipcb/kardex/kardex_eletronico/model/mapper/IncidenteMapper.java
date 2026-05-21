package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateIncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.IncidenteClinico;

@Mapper(componentModel = "spring")
public interface IncidenteMapper {
    IncidenteDTO toDTO(IncidenteClinico utilizador);

    IncidenteClinico toEntity(IncidenteDTO dto);

    IncidenteClinico fromCreate(CreateIncidenteDTO dto);

    List<IncidenteDTO> toDTOList(List<IncidenteClinico> utilizadores);
}
