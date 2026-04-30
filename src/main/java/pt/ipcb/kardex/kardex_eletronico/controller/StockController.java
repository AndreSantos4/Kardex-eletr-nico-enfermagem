package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;

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
}
