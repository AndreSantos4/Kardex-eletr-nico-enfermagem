package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.*;
import pt.ipcb.kardex.kardex_eletronico.service.shift.ShiftService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/shifts")
public class ShiftController{

    private final ShiftService service;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createShift(@RequestBody CreateShiftDTO data){
        service.createShift(data);
        return ResponseEntity.ok(ApiResponse.ok("Turno criado com sucesso", null));
    }

    @PatchMapping("/{shiftId}")
    public ResponseEntity<ApiResponse<?>> editShift(@PathVariable Long shiftId, @RequestBody CreateShiftDTO data){
        service.editShift(shiftId, data);
        return ResponseEntity.ok(ApiResponse.ok("Turno editado com sucesso", null));
    }

    @DeleteMapping("/{shiftId}")
    public ResponseEntity<ApiResponse<?>> deleteShift(@PathVariable Long shiftId){
        service.deleteShift(shiftId);
        return ResponseEntity.ok(ApiResponse.ok("Turno eliminado com sucesso", null));
    }

    @PostMapping("/{shiftId}/assignments")
    public ResponseEntity<ApiResponse<?>> assignNurse(@PathVariable Long shiftId, @RequestBody AssignNursesDTO data){
        service.assignNurses(shiftId, data);
        return ResponseEntity.ok(ApiResponse.ok("Enfermeiros atribuidos com sucesso", null));
    }

    @GetMapping("/{shiftId}")
    public ResponseEntity<ApiResponse<TurnoDTO>> getShift(@PathVariable Long shiftId){
        var shift = service.getShift(shiftId);
        return ResponseEntity.ok(ApiResponse.ok("Turno obtido com sucesso", shift));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TurnoDTO>>> getAllShifts(){
        var shifts = service.getAllShifts();
        return ResponseEntity.ok(ApiResponse.ok("Turnos obtidos com sucesso", shifts));
    }

    @GetMapping("/{shiftId}/change")
    public ResponseEntity<ApiResponse<PassagemTurnoDTO>> getShiftChange(@PathVariable Long shiftId){
        var shiftChange = service.getShiftChange(shiftId);
        return ResponseEntity.ok(ApiResponse.ok("Mudanca de turno obtido com sucesso", shiftChange));
    }

    @PostMapping("/{shiftId}/change")
    public ResponseEntity<ApiResponse<PassagemTurnoDTO>> executeShiftChange(@PathVariable Long shiftId, @RequestBody CreateShiftChangeDTO data){
        service.executeShiftChange(shiftId, data);
        return ResponseEntity.ok(ApiResponse.ok("Mudanca de turno realizada com sucesso", null));
    }
}
