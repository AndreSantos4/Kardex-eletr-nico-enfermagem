package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;
import pt.ipcb.kardex.kardex_eletronico.dto.note.CreateClinicNoteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.note.NotaClinicaDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.NotaEvolucaoClinica;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotaClinicaMapper {

    NotaEvolucaoClinica fromCreate(CreateClinicNoteDTO data);

    NotaClinicaDTO toDTO(NotaEvolucaoClinica data);

    NotaEvolucaoClinica toEntity(NotaClinicaDTO data);

    List<NotaClinicaDTO> toDTOList(List<NotaEvolucaoClinica> data);
}
