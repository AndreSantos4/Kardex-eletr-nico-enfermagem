package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Registo;
import pt.ipcb.kardex.kardex_eletronico.model.entity.RegistoClinico;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RegistoMapper {

    RegistoDTO toDTO(Registo registo);

    List<RegistoDTO> toDTOList(List<Registo> registos);

    RegistoClinicoDTO toClinicDTO(RegistoClinico registo);

    List<RegistoClinicoDTO> toCLinicDTOList(List<RegistoClinico> registos);
}
