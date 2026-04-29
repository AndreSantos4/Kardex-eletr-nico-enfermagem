package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;

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
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
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
}
