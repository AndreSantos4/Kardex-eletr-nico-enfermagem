package pt.ipcb.kardex.kardex_eletronico.controller.Process;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.MaxDoseAlertDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.administration.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.SuspendPrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;
import pt.ipcb.kardex.kardex_eletronico.service.process.prescription.PrescriptionService;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class PrescriptionController {

    private final PrescriptionService service;

    @PostMapping("/{processId}/prescriptions")
    public ResponseEntity<ApiResponse<?>> createPrescription(@PathVariable Long processId, @RequestBody CreatePrescriptionDTO data){
        service.createPrescription(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Prescrição criada com sucesso", null));
    }

    @PostMapping("/prescriptions/{prescriptionId}/administrations")
    public ResponseEntity<ApiResponse<MaxDoseAlertDTO>> administrateMedication(@PathVariable Long prescriptionId, @RequestBody CreateAdministrationDTO data){
        var alert = service.administrateMedication(prescriptionId, data);
        return ResponseEntity.ok(ApiResponse.ok("Administracao efetuada com sucesso", alert));
    }

    @GetMapping("/{processId}/prescriptions")
    public ResponseEntity<ApiResponse<?>> getPrescriptionHistory(
            @PathVariable Long processId,
            @RequestParam(value = "s", required = false) PrescriptionState state,
            @RequestParam(value = "f", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "t", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from != null && to != null && to.isBefore(from)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("O intervalo de datas é inválido"));
        }
        var prescriptions = service.getPrescriptionHistory(processId, state, from, to);
        return ResponseEntity.ok(ApiResponse.ok("Historico de prescricoes obtidas com sucesso", prescriptions));
    }

    @PatchMapping("/prescriptions/{prescriptionId}/suspend")
    public ResponseEntity<ApiResponse<?>> suspendPrescription(@PathVariable Long prescriptionId, @RequestBody SuspendPrescriptionDTO data){
        service.suspendPrescription(prescriptionId, data);
        return ResponseEntity.ok(ApiResponse.ok("Prescricao suspendida com sucesso"));
    }
}
