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
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class ProcessController {

    private final ProcessService service;   

    @PostMapping("/{processId}/prescriptions")
    public ResponseEntity<ApiResponse<?>> createPrescription(@PathVariable("processId") Long processId, @RequestBody CreatePrescriptionDTO data){
        service.createPrescription(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Prescrição criada com sucesso", null));
    }

    @PostMapping("/prescriptions/{prescriptionId}/administrations")
    public ResponseEntity<ApiResponse<?>> administrateMedication(@PathVariable("prescriptionId") Long prescriptionId, @RequestBody CreateAdministrationDTO data){
        service.administrateMedication(prescriptionId, data);
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
        var prescriptions = service.getPrescriptionHistory(processId, state, from, to);
        return ResponseEntity.ok(ApiResponse.ok("Historico de prescricoes obtidas com sucesso", prescriptions));
    }

    @PatchMapping("/prescriptions/{prescriptionId}/suspend")
    public ResponseEntity<ApiResponse<?>> suspendPrescription(@PathVariable("prescriptionId") Long prescriptionId){
        service.suspendPrescription(prescriptionId);
        return ResponseEntity.ok(ApiResponse.ok("Prescricao suspendida com sucesso"));
    }

    @GetMapping("/beds")
    public ResponseEntity<ApiResponse<List<CamaDTO>>> getAllBeds(@RequestParam(name = "o", defaultValue = "false") boolean occupied){
        var beds = service.getAllBeds(occupied);
        return ResponseEntity.ok(ApiResponse.ok("Camas obtidas com sucesso", beds));
    }

    @PostMapping("/{processId}/vitals")
    public ResponseEntity<ApiResponse<?>> registerVitalSigns(@PathVariable("processId") Long processId, @RequestBody RegisterVitalSignsDTO vitalSigns){
        service.registerVitalSigns(processId, vitalSigns);
        return ResponseEntity.ok(ApiResponse.ok("Sinais vitais registados com sucesso"));
    }

    @PatchMapping("/{processId}/discharge")
    public ResponseEntity<ApiResponse<?>> dischargePatient(@PathVariable("processId") Long processId, @RequestBody DischargePatientDTO data){
        service.dischargePatient(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Alta clinica registada", null));
    }

    @PostMapping("/{processId}/plan")
    public ResponseEntity<ApiResponse<?>> createCarePlan(@PathVariable("processId") Long processId, @RequestBody CreateCarePlanDTO data){
        service.createCarePlan(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Plano de cuidados criado com sucesso", null));
    }

    @GetMapping("/{processId}/plan")
    public ResponseEntity<ApiResponse<PlanoCuidadosDTO>> getCarePlan(@PathVariable("processId") Long processId){
        var plan = service.getCarePlan(processId);
        return ResponseEntity.ok(ApiResponse.ok("Plano de cuidados obtido com sucesso", plan));
    }
}
