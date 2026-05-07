package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PlanoCuidados;

@Mapper(componentModel = "spring")
public interface PlanoCuidadosMapper {
    PlanoCuidados toEntity(CreateCarePlanDTO data);

    PlanoCuidadosDTO toDto(PlanoCuidados data);
}
