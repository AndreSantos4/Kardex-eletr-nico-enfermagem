package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreateAlergyDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Alergia;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Prescricao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

@Mapper(componentModel = "spring")
public interface UtenteMapper {
    UtenteDTO toDTO(Prescricao utilizador);

    Utente toEntity(UtenteDTO dto);

    List<UtenteDTO> toDTOList(List<Utente> utilizadores);

    Alergia toAlergiaEntity(AlergiaDTO data);

    Alergia fromCreateAlergy(CreateAlergyDTO data);

    AlergiaDTO toAlergiaDTO(Alergia data);
}
