package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stock")
public class StockController {

    private final StockService service;

    @PostMapping("/medications")
    public ResponseEntity<ApiResponse<?>> addMedication(@RequestBody CreateMedicationDTO data){
        service.addMedication(data);
        return ResponseEntity.ok(ApiResponse.ok("Medicamento adicionado ao estoque com sucesso", null));
    }
    
    @GetMapping("/medications")
    public ResponseEntity<ApiResponse<List<MedicamentoDTO>>> getAllMedications() {
        var medications = service.getAllMedications();
        return ResponseEntity.ok(ApiResponse.ok("Medicamentos obtidos com sucesso", medications));
    }
    
    @PutMapping("/medications/{medicationId}")
    public ResponseEntity<ApiResponse<?>> editMedication(@PathVariable("medicationId") Long medicationId, @RequestBody CreateMedicationDTO data){
        service.editMedication(medicationId, data);
        return ResponseEntity.ok(ApiResponse.ok("Medicamento editado com sucesso", null));
    }
    
    @PatchMapping("/medications/{medicationId}/deactivate")
    public ResponseEntity<ApiResponse<?>> deactivateMedication(@PathVariable("medicationId") Long medicationId){
        service.deactivateMedication(medicationId);
        return ResponseEntity.ok(ApiResponse.ok("Medicamento desativado com sucesso", null));
    }
    
    @PatchMapping("/medications/{medicationId}/activate")
    public ResponseEntity<ApiResponse<?>> activateMedication(@PathVariable("medicationId") Long medicationId){
        service.activateMedication(medicationId);
        return ResponseEntity.ok(ApiResponse.ok("Medicamento ativado com sucesso", null));
    }
}
