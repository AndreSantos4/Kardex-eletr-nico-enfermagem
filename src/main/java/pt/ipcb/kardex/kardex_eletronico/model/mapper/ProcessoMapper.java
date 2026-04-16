package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.SinalVitalDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.SinalVital;

@Mapper(componentModel = "spring")
public interface ProcessoMapper {
    @Mapping(target = "utenteId", source = "data.utente.id")
    ProcessoClinicoDTO toDTO(ProcessoClinico data);

    ProcessoClinico toEntity(ProcessoClinicoDTO dto);

    ProcessoClinico fromCreate(CreateProcessDTO dto);
     
    List<ProcessoClinicoDTO> toDTOList(List<ProcessoClinico> utilizadores);

    SinalVital fromVitalSignRegister(RegisterVitalSignsDTO data);

    List<SinalVitalDTO> toSinalVitalDTOList(List<SinalVital> data);
}
