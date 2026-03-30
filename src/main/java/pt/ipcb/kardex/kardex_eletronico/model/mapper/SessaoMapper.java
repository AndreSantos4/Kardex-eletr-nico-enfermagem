package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Sessao;

@Mapper(componentModel = "spring")
public interface SessaoMapper {
    SessaoDTO toDTO(Sessao prescricao);

    Sessao toEntity(SessaoDTO dto);

    List<SessaoDTO> toDTOList(List<Sessao> prescricoes);
}
