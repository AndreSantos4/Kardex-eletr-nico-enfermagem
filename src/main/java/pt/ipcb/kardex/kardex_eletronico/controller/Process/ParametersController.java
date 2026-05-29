package pt.ipcb.kardex.kardex_eletronico.controller.Process;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.*;
import pt.ipcb.kardex.kardex_eletronico.service.process.parameters.ParametersService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class ParametersController {

    private final ParametersService service;

    @PostMapping("/{processId}/cateteres")
    public ResponseEntity<ApiResponse<?>> registerCateter(@PathVariable Long processId, @RequestBody CreateCateterDTO data){
        service.registerCateter(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Cateter registado com sucesso", null));
    }

    @GetMapping("/{processId}/cateteres")
    public ResponseEntity<ApiResponse<List<CateterDTO>>> getAllCateteres(@PathVariable Long processId){
        var cateteres = service.getAllCateteres(processId);
        return ResponseEntity.ok(ApiResponse.ok("Cateteres obtidos com sucesso", cateteres));
    }

    @PostMapping("/{processId}/incidents")
    public ResponseEntity<ApiResponse<?>> registerIncident(@PathVariable Long processId, @RequestBody CreateIncidenteDTO data){
        service.registerIncident(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Incidente registado com sucesso", null));
    }

    @GetMapping("/{processId}/incidents")
    public ResponseEntity<ApiResponse<List<IncidenteDTO>>> getAllIncidents(@PathVariable Long processId){
        var cateteres = service.getAllIncidents(processId);
        return ResponseEntity.ok(ApiResponse.ok("Incidentes obtidos com sucesso", cateteres));
    }

    @PostMapping("/{processId}/containments")
    public ResponseEntity<ApiResponse<?>> registerContainments(@PathVariable Long processId, @RequestBody CreateContencaoDTO data){
        service.registerContainment(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Contencao registado com sucesso", null));
    }

    @GetMapping("/{processId}/containments")
    public ResponseEntity<ApiResponse<List<ContencaoDTO>>> getAllContainments(@PathVariable Long processId) {
        var cateteres = service.getAllCointainments(processId);
        return ResponseEntity.ok(ApiResponse.ok("Contencoes obtidos com sucesso", cateteres));
    }
}
