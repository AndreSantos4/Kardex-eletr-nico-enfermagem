package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreateAlergyDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Alergia;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FlagRisco;

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

    List<AlergiaDTO> toAlergiaDTOList(List<Alergia> data);

    default List<FlagRisco> toList(Set<FlagRisco> set) {
        return set == null ? new ArrayList<>() : new ArrayList<>(set);
    }
}
