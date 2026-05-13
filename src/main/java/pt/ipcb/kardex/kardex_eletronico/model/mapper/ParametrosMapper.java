package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CateterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.ContencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateCateterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateContencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateIncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Cateter;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Contencao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.IncidenteClinico;

@Mapper(componentModel = "spring")
public interface ParametrosMapper {
    Cateter fromCreateCateterDto(CreateCateterDTO data);

    CateterDTO toCateterDto(Cateter data);

    List<CateterDTO> toCateterDtoList(List<Cateter> data);

    IncidenteClinico fromCreateIncidentDto(CreateIncidenteDTO data);

    IncidenteDTO toCIncidentDto(IncidenteClinico data);

    List<IncidenteDTO> toIncidentDtoList(List<IncidenteClinico> data);

    Contencao fromCreateContainmentDto(CreateContencaoDTO data);

    IncidenteDTO ToContainmentDto(Contencao data);

    List<ContencaoDTO> toContainmentDtoList(List<Contencao> data);
}
