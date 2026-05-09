package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.AssignNursesDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
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
}
