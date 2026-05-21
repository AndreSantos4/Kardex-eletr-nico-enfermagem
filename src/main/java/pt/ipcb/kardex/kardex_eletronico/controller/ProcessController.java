package pt.ipcb.kardex.kardex_eletronico.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CateterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.ContencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateCateterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateContencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateIncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.RegisterInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.SuspendPrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;
import pt.ipcb.kardex.kardex_eletronico.service.process.parameters.ParametersService;
import pt.ipcb.kardex.kardex_eletronico.service.process.plan.PlanService;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.process.prescription.PrescriptionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class ProcessController {

    private final ProcessService processService;
    private final PlanService planService;
    private final ParametersService  parametersService;
    private final PrescriptionService prescriptionService;

    @PostMapping("/{processId}/prescriptions")
    public ResponseEntity<ApiResponse<?>> createPrescription(@PathVariable("processId") Long processId, @RequestBody CreatePrescriptionDTO data){
        prescriptionService.createPrescription(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Prescrição criada com sucesso", null));
    }

    @PostMapping("/prescriptions/{prescriptionId}/administrations")
    public ResponseEntity<ApiResponse<?>> administrateMedication(@PathVariable("prescriptionId") Long prescriptionId, @RequestBody CreateAdministrationDTO data){
        prescriptionService.administrateMedication(prescriptionId, data);
        return ResponseEntity.ok(ApiResponse.ok("Administracao efetuada com sucesso", null));
    }

    @GetMapping("/{processId}/prescriptions")
    public ResponseEntity<ApiResponse<?>> getPrescriptionHistory(
        @PathVariable("processId") Long processId, 
        @RequestParam(value = "s", required = false) PrescriptionState state,
        @RequestParam(value = "f", required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate from,
        @RequestParam(value = "t", required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate to) {

        if (from != null && to != null && to.isBefore(from)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("O intervalo de datas é inválido"));
        }
        var prescriptions = prescriptionService.getPrescriptionHistory(processId, state, from, to);
        return ResponseEntity.ok(ApiResponse.ok("Historico de prescricoes obtidas com sucesso", prescriptions));
    }

    @PatchMapping("/prescriptions/{prescriptionId}/suspend")
    public ResponseEntity<ApiResponse<?>> suspendPrescription(@PathVariable("prescriptionId") Long prescriptionId, @RequestBody SuspendPrescriptionDTO data){
        prescriptionService.suspendPrescription(prescriptionId, data);
        return ResponseEntity.ok(ApiResponse.ok("Prescricao suspendida com sucesso"));
    }

    @GetMapping("/beds")
    public ResponseEntity<ApiResponse<List<CamaDTO>>> getAllBeds(@RequestParam(name = "o", defaultValue = "false") boolean occupied){
        var beds = processService.getAllBeds(occupied);
        return ResponseEntity.ok(ApiResponse.ok("Camas obtidas com sucesso", beds));
    }

    @PostMapping("/{processId}/vitals")
    public ResponseEntity<ApiResponse<?>> registerVitalSigns(@PathVariable("processId") Long processId, @RequestBody RegisterVitalSignsDTO vitalSigns){
        processService.registerVitalSigns(processId, vitalSigns);
        return ResponseEntity.ok(ApiResponse.ok("Sinais vitais registados com sucesso"));
    }

    @PostMapping("/{processId}/cateteres")
    public ResponseEntity<ApiResponse<?>> registerCateter(@PathVariable("processId") Long processId, @RequestBody CreateCateterDTO data){
        parametersService.registerCateter(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Cateter registado com sucesso", null));
    }

    @GetMapping("/{processId}/cateteres")
    public ResponseEntity<ApiResponse<List<CateterDTO>>> getAllCateteres(@PathVariable("processId") Long processId){
        var cateteres = parametersService.getAllCateteres(processId);
        return ResponseEntity.ok(ApiResponse.ok("Cateteres obtidos com sucesso", cateteres));
    }

    @PatchMapping("/{processId}/discharge")
    public ResponseEntity<ApiResponse<?>> dischargePatient(@PathVariable("processId") Long processId, @RequestBody DischargePatientDTO data){
        processService.dischargePatient(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Alta clinica registada", null));
    }

    @PostMapping("/{processId}/incidents")
    public ResponseEntity<ApiResponse<?>> registerIncident(@PathVariable("processId") Long processId, @RequestBody CreateIncidenteDTO data){
        parametersService.registerIncident(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Incidente registado com sucesso", null));
    }

    @GetMapping("/{processId}/incidents")
    public ResponseEntity<ApiResponse<List<IncidenteDTO>>> getAllIncidents(@PathVariable("processId") Long processId){
        var cateteres = parametersService.getAllIncidents(processId);
        return ResponseEntity.ok(ApiResponse.ok("Incidentes obtidos com sucesso", cateteres));
    }

    @PostMapping("/{processId}/containments")
    public ResponseEntity<ApiResponse<?>> registerContainments(@PathVariable("processId") Long processId, @RequestBody CreateContencaoDTO data){
        parametersService.registerContainment(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Contencao registado com sucesso", null));
    }

    @GetMapping("/{processId}/containments")
    public ResponseEntity<ApiResponse<List<ContencaoDTO>>> getAllContainments(@PathVariable("processId") Long processId) {
        var cateteres = parametersService.getAllCointainments(processId);
        return ResponseEntity.ok(ApiResponse.ok("Contencoes obtidos com sucesso", cateteres));
    }

    @PostMapping("/{processId}/plan")
    public ResponseEntity<ApiResponse<?>> createCarePlan(@PathVariable("processId") Long processId, @RequestBody CreateCarePlanDTO data){
        planService.createCarePlan(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Plano de cuidados criado com sucesso", null));
    }

    @GetMapping("/{processId}/plan")
    public ResponseEntity<ApiResponse<PlanoCuidadosDTO>> getCarePlan(@PathVariable Long processId){
        var plan = planService.getCarePlan(processId);
        return ResponseEntity.ok(ApiResponse.ok("Plano de cuidados obtido com sucesso", plan));
    }

    @PostMapping("/{processId}/plan/interventions")
    public ResponseEntity<ApiResponse<?>> addIntervention(@PathVariable Long processId, @RequestBody CreateInterventionDTO data){
        planService.addIntervention(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Intervencao adicionada com sucesso", null));
    }

    @PostMapping("/interventions/{interventionId}")
    public ResponseEntity<ApiResponse<?>> registerIntervention(@PathVariable Long interventionId, @RequestBody RegisterInterventionDTO data){
        planService.registerIntervention(interventionId, data);
        return ResponseEntity.ok(ApiResponse.ok("Intervencao registada com sucesso", null));
    }

    @PatchMapping("/interventions/{interventionId}")
    public ResponseEntity<ApiResponse<?>> unmarkIntervention(@PathVariable Long interventionId){
        planService.unmarkIntervention(interventionId);
        return ResponseEntity.ok(ApiResponse.ok("Intervencao desmarcada como executada com sucesso", null));
    }
}
