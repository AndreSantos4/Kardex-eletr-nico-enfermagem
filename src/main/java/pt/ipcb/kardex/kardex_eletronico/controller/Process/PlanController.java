package pt.ipcb.kardex.kardex_eletronico.controller.Process;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.RegisterInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.service.process.plan.PlanService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class PlanController {

    private final PlanService service;

    @PostMapping("/{processId}/plan")
    public ResponseEntity<ApiResponse<?>> createCarePlan(@PathVariable("processId") Long processId, @RequestBody CreateCarePlanDTO data){
        service.createCarePlan(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Plano de cuidados criado com sucesso", null));
    }

    @GetMapping("/{processId}/plan")
    public ResponseEntity<ApiResponse<PlanoCuidadosDTO>> getCarePlan(@PathVariable Long processId){
        var plan = service.getCarePlan(processId);
        return ResponseEntity.ok(ApiResponse.ok("Plano de cuidados obtido com sucesso", plan));
    }

    @PostMapping("/{processId}/plan/interventions")
    public ResponseEntity<ApiResponse<?>> addIntervention(@PathVariable Long processId, @RequestBody CreateInterventionDTO data){
        service.addIntervention(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Intervencao adicionada com sucesso", null));
    }

    @PostMapping("/interventions/{interventionId}")
    public ResponseEntity<ApiResponse<?>> registerIntervention(@PathVariable Long interventionId, @RequestBody RegisterInterventionDTO data){
        service.registerIntervention(interventionId, data);
        return ResponseEntity.ok(ApiResponse.ok("Intervencao registada com sucesso", null));
    }

    @PatchMapping("/interventions/{interventionId}")
    public ResponseEntity<ApiResponse<?>> unmarkIntervention(@PathVariable Long interventionId){
        service.unmarkIntervention(interventionId);
        return ResponseEntity.ok(ApiResponse.ok("Intervencao desmarcada como executada com sucesso", null));
    }
}
