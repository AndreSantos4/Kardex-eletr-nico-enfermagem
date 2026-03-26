package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/workers")
public class WorkerController {

    private final WorkerService service;

    @PostMapping("{workerId}/shifts/add/{shiftId}")
    public ResponseEntity<ApiResponse<?>> addToShift(@PathVariable("workerId") Long workerId, @PathVariable("shiftId") Long shiftId){
        service.addToShift(workerId, shiftId);
        return ResponseEntity.ok(ApiResponse.ok("Funcionário adicionado ao turno com sucesso", null));
    }

    @PostMapping("{workerId}/shifts/remove/{shiftId}")
    public ResponseEntity<ApiResponse<?>> removeFromShift(@PathVariable("workerId") Long workerId, @PathVariable("shiftId") Long shiftId){
        service.removeFromShift(workerId, shiftId);
        return ResponseEntity.ok(ApiResponse.ok("Funcionário removido do turno com sucesso", null));
    }

    @GetMapping("{id}/shifts")
    public ResponseEntity<ApiResponse<List<TurnoDTO>>> getWorkerShifts(@PathVariable Long id, @RequestParam(name = "r", defaultValue = "28") int range) {
        var shifts = service.getWorkerShifts(id, range);
        return ResponseEntity.ok(ApiResponse.ok("Turnos encontrados com sucesso", shifts));
    }
}
