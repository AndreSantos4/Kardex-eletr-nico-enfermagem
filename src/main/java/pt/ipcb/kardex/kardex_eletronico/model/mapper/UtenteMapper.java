package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreateAlergyDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Alergia;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

@Mapper(componentModel = "spring")
public interface UtenteMapper {
    @Mapping(target = "id", source = "utente.id")
    @Mapping(target = "processo", source = "processoClinico")
    UtenteDTO toDto(Utente utente, ProcessoClinicoDTO processoClinico);

    Utente toEntity(UtenteDTO dto);

    List<UtenteDTO> toDTOList(List<Utente> utilizadores);

    Alergia toAlergiaEntity(AlergiaDTO data);

    Alergia fromCreateAlergy(CreateAlergyDTO data);

    AlergiaDTO toAlergiaDTO(Alergia data);
}
