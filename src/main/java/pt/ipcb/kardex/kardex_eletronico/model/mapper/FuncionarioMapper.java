package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;

@Mapper(componentModel = "spring")
public interface FuncionarioMapper {
    FuncionarioDTO toDTO(Funcionario data);

    Funcionario toEntity(FuncionarioDTO dto);

    List<FuncionarioDTO> toDTOList(List<Funcionario> data);
}
