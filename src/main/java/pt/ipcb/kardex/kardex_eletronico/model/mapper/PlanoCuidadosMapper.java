package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.IntervencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Intervencao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PlanoCuidados;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlanoCuidadosMapper {
    PlanoCuidados toEntity(CreateCarePlanDTO data);

    PlanoCuidadosDTO toDTO(PlanoCuidados data);

    Intervencao toEntity(CreateInterventionDTO data);

    IntervencaoDTO toDTO(Intervencao data);

    List<IntervencaoDTO> toDtoList(List<Intervencao> data);
}
