package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.service.patient.PatientService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/patients")
public class PatientController {

    private final PatientService service;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createPatientFile(@RequestBody CreatePatientFileDTO data){
        service.createPatient(data);
        return ResponseEntity.ok(ApiResponse.ok("Ficha de utente criada com sucesso", null));
    }

    @PutMapping("/{patientId}")
    public ResponseEntity<ApiResponse<?>> editPatientFile(@PathVariable("patientId") Long id, @RequestBody UpdatePacientFileDTO data){
        service.editPatientFile(id, data);
        return ResponseEntity.ok(ApiResponse.ok("Ficha de utente editada com sucesso", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UtenteDTO>>> getAllPatitents(@RequestParam("f") Optional<String> filter){
        var patients = service.getAllPatients(filter);
        return ResponseEntity.ok(ApiResponse.ok("Utentes obtidos com sucesso", patients));
    }

    @GetMapping("/alergies")
    public ResponseEntity<ApiResponse<List<AlergiaDTO>>> getAllAlergies(){
        var alergies = service.getAllAlergies();
        return ResponseEntity.ok(ApiResponse.ok("Alergias obtidas com sucesso", alergies));
    }
}
