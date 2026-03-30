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
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.ShiftSummaryDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.WorkerActivitySummary;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/workers")
public class WorkerController {

    private final WorkerService service;

    @GetMapping("/users/{userId}/worker")
    public ResponseEntity<ApiResponse<FuncionarioDTO>> getWorkerByUserId(@PathVariable("userId") Long userId){
        var worker = service.getWorkerFromUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("Funcionário obtido com sucesso", worker));
    }

    @GetMapping("/{workerId}/summary")
    public ResponseEntity<ApiResponse<WorkerActivitySummary>> getWorkerActivitySummary(@PathVariable("workerId") Long workerId){
        var summary = service.getWorkerActivitySummary(workerId);
        return ResponseEntity.ok(ApiResponse.ok("Resumo do funcionário obtico com sucesso", summary));
    }

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

    @GetMapping("{workerId}/shifts")
    public ResponseEntity<ApiResponse<List<TurnoDTO>>> getWorkerShifts(@PathVariable Long workerId, @RequestParam(name = "r", defaultValue = "28") int range) {
        var shifts = service.getWorkerShifts(workerId, range);
        return ResponseEntity.ok(ApiResponse.ok("Turnos encontrados com sucesso", shifts));
    }

    @GetMapping("{workerId}/shifts/summary")
    public ResponseEntity<ApiResponse<List<ShiftSummaryDTO>>> getWorkerShiftsSummary(@PathVariable Long workerId) {
        var shiftsInfo = service.getWorkerShiftsInfo(workerId);
        return ResponseEntity.ok(ApiResponse.ok("Resumo do turnos obtidos com sucesso", shiftsInfo));
    }
}
