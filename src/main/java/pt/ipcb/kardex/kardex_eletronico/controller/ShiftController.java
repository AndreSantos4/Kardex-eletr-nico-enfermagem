package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateIncidentDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.service.shift.ShiftService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/shifts")
public class ShiftController{

    private final ShiftService service;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createShift(@RequestBody CreateShiftDTO data){
        service.CreateShift(data);
        return ResponseEntity.ok(ApiResponse.ok("Turno criado com sucesso", null));
    }

    @PostMapping("/incidents")
    public ResponseEntity<ApiResponse<?>> createIncident(@RequestBody CreateIncidentDTO data, HttpServletRequest request){
        service.createIncident(data, request);
        return ResponseEntity.ok(ApiResponse.ok("Incidente registado com sucesso", null));
    }
}
