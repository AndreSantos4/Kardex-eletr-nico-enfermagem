package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

@Mapper(componentModel = "spring")
public interface UtilizadorMapper {
    UtilizadorDTO toDTO(Utilizador utilizador);

    Utilizador toEntity(UtilizadorDTO dto);

    List<UtilizadorDTO> toDTOList(List<Utilizador> utilizadores);
}
