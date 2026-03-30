package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;

@Mapper(componentModel = "spring")
public interface ProcessoMapper {
    ProcessoClinicoDTO toDTO(ProcessoClinico utilizador);

    ProcessoClinico toEntity(ProcessoClinicoDTO dto);

    ProcessoClinico fromCreate(CreateProcessDTO dto);

    List<ProcessoClinicoDTO> toDTOList(List<ProcessoClinico> utilizadores);
}
