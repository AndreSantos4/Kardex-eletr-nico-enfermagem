package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;

@Mapper(componentModel = "spring")
public interface FuncionarioMapper {
    @Mapping(source = "utilizador", target = "dados")
    FuncionarioDTO toDTO(Funcionario prescricao);

    Funcionario toEntity(FuncionarioDTO dto);

    List<FuncionarioDTO> toDTOList(List<Funcionario> prescricoes);
}
