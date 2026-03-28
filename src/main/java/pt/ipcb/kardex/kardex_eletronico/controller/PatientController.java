package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/patients")
public class PatientController {

    private final PatientService service;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createPatient(@RequestBody CreatePatientDTO data){
        service.createPatient(data);
        return ResponseEntity.ok(ApiResponse.ok("Utente criado com sucesso", null));
    }

    @PostMapping("/{patientId}/processes")
    public ResponseEntity<ApiResponse<?>> createProcess(@PathVariable("patientId") Long patientId, @RequestBody CreateProcessDTO data){
        service.createProcess(patientId, data);
        return ResponseEntity.ok(ApiResponse.ok("Processo Clínico criado com sucesso", null));
    }
}
