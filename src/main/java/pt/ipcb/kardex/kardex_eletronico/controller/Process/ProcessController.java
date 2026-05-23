package pt.ipcb.kardex.kardex_eletronico.controller.Process;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class ProcessController {

    private final ProcessService service;

    @GetMapping("/beds")
    public ResponseEntity<ApiResponse<List<CamaDTO>>> getAllBeds(@RequestParam(name = "o", defaultValue = "false") boolean occupied){
        var beds = service.getAllBeds(occupied);
        return ResponseEntity.ok(ApiResponse.ok("Camas obtidas com sucesso", beds));
    }

    @PostMapping("/{processId}/vitals")
    public ResponseEntity<ApiResponse<?>> registerVitalSigns(@PathVariable Long processId, @RequestBody RegisterVitalSignsDTO vitalSigns){
        service.registerVitalSigns(processId, vitalSigns);
        return ResponseEntity.ok(ApiResponse.ok("Sinais vitais registados com sucesso"));
    }

    @PatchMapping("/{processId}/discharge")
    public ResponseEntity<ApiResponse<?>> dischargePatient(@PathVariable Long processId, @RequestBody DischargePatientDTO data){
        service.dischargePatient(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Alta clinica registada", null));
    }
}
