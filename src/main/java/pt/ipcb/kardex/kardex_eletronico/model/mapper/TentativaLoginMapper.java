package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.authentication.TentativaLoginDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.TentativaLogin;

@Mapper(componentModel = "spring")
public interface TentativaLoginMapper {
    TentativaLoginDTO toDTO(TentativaLogin utilizador);

    TentativaLogin toEntity(TentativaLoginDTO dto);

    List<TentativaLoginDTO> toDTOList(List<TentativaLogin> utilizadores);
}
