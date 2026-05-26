package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.ShiftChangeFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.*;
import pt.ipcb.kardex.kardex_eletronico.dto.util.Pagination;
import pt.ipcb.kardex.kardex_eletronico.service.shift.ShiftService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/shifts")
public class ShiftController {

    private final ShiftService service;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createShift(
        @RequestBody CreateShiftDTO data
    ) {
        service.createShift(data);
        return ResponseEntity.ok(
            ApiResponse.ok("Turno criado com sucesso", null)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<TurnoDTO>> getPendingShift() {
        var pending = service.getPendingShift();
        return ResponseEntity.ok(
            ApiResponse.ok("Turno obtido com sucesso", pending)
        );
    }

    @PatchMapping("/{shiftId}")
    public ResponseEntity<ApiResponse<?>> editShift(
        @PathVariable Long shiftId,
        @RequestBody CreateShiftDTO data
    ) {
        service.editShift(shiftId, data);
        return ResponseEntity.ok(
            ApiResponse.ok("Turno editado com sucesso", null)
        );
    }

    @DeleteMapping("/{shiftId}")
    public ResponseEntity<ApiResponse<?>> deleteShift(
        @PathVariable Long shiftId
    ) {
        service.deleteShift(shiftId);
        return ResponseEntity.ok(
            ApiResponse.ok("Turno eliminado com sucesso", null)
        );
    }

    @PostMapping("/{shiftId}/assignments")
    public ResponseEntity<ApiResponse<?>> assignNurse(
        @PathVariable Long shiftId,
        @RequestBody AssignNursesDTO data
    ) {
        service.assignNurses(shiftId, data);
        return ResponseEntity.ok(
            ApiResponse.ok("Enfermeiros atribuidos com sucesso", null)
        );
    }

    @GetMapping("/{shiftId}")
    public ResponseEntity<ApiResponse<TurnoDTO>> getShift(
        @PathVariable Long shiftId
    ) {
        var shift = service.getShift(shiftId);
        return ResponseEntity.ok(
            ApiResponse.ok("Turno obtido com sucesso", shift)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TurnoDTO>>> getAllShifts() {
        var shifts = service.getAllShifts();
        return ResponseEntity.ok(
            ApiResponse.ok("Turnos obtidos com sucesso", shifts)
        );
    }

    @PostMapping("/{shiftId}/change")
    public ResponseEntity<ApiResponse<PassagemTurnoDTO>> executeShiftChange(
        @PathVariable Long shiftId,
        @RequestBody CreateShiftChangeDTO data
    ) {
        service.executeShiftChange(shiftId, data);
        return ResponseEntity.ok(
            ApiResponse.ok("Mudanca de turno realizada com sucesso", null)
        );
    }

    @PatchMapping("/{shiftId}/change/validate")
    public ResponseEntity<ApiResponse<?>> validateShiftChange(
        @PathVariable Long shiftId,
        @RequestBody CreateShiftChangeDTO data
    ) {
        service.validateShiftChange(shiftId, data);
        return ResponseEntity.ok(
            ApiResponse.ok("Mudanca de turno validada com sucesso", null)
        );
    }

    @PatchMapping("/{shiftId}/change/send-back")
    public ResponseEntity<ApiResponse<?>> sendBackShiftChange(
        @PathVariable Long shiftId
    ) {
        service.sendBackShiftChange(shiftId);
        return ResponseEntity.ok(
            ApiResponse.ok(
                "Mudanca de turno enviada de volta para correcao com sucesso",
                null
            )
        );
    }

    @GetMapping("/{shiftId}/pending")
    public ResponseEntity<
        ApiResponse<List<PendenciaDTO>>
    > getLastShiftPendingIssues(@PathVariable Long shiftId) {
        var pendingIssues = service.getPendingIssues(shiftId);
        return ResponseEntity.ok(
            ApiResponse.ok("Pendencias obtidas com sucesso", pendingIssues)
        );
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<TurnoDTO>> getCurrentShift() {
        var shift = service.getCurrentShift();
        return ResponseEntity.ok(
            ApiResponse.ok("Turno atual obtido com sucesso", shift)
        );
    }

    @GetMapping("/{shiftId}/change")
    public ResponseEntity<ApiResponse<PassagemTurnoDTO>> getShiftChange(
        @PathVariable Long shiftId
    ) {
        var change = service.getShiftChange(shiftId);
        return ResponseEntity.ok(
            ApiResponse.ok("Mudanca de turno obtida com sucesso", change)
        );
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PassagemTurnoDTO>>> getShiftHistory(Pagination pagination, ShiftChangeFilter filter){
        var changes = service.getShiftHistory(pagination, filter);
        return ResponseEntity.ok(ApiResponse.ok("Historico de mudancas de turno obtido com sucesso", changes));
    }
}
