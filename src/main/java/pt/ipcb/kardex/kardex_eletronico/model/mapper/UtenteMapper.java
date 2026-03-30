package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Prescricao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

@Mapper(componentModel = "spring")
public interface UtenteMapper {
    UtenteDTO toDTO(Prescricao utilizador);

    Utente toEntity(UtenteDTO dto);

    Utente fromCreate(CreatePatientDTO dto);

    List<UtenteDTO> toDTOList(List<Utente> utilizadores);
}
