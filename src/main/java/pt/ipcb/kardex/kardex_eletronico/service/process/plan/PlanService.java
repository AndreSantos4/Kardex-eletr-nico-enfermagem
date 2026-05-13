package pt.ipcb.kardex.kardex_eletronico.service.process.plan;

import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.RegisterInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PlanoCuidados;

public interface PlanService {

    public PlanoCuidados getCarePlanEntity(Long processId);

    public PlanoCuidadosDTO getCarePlan(Long processId);

    void createCarePlan(Long processId, CreateCarePlanDTO data);

    void addIntervention(Long processId, CreateInterventionDTO data);

    void registerIntervention(Long interventionId, RegisterInterventionDTO data);
}
