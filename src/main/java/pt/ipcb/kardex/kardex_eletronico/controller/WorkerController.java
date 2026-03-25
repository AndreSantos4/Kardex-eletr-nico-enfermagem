package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/workers")
public class WorkerController {

    private final WorkerService service;

    @GetMapping("{id}/shifts")
    public ResponseEntity<ApiResponse<List<TurnoDTO>>> getWorkerShifts(@PathVariable Long id, @RequestParam(name = "r", defaultValue = "28") int range) {
        var shifts = service.getWorkerShifts(id, range);
        return ResponseEntity.ok(ApiResponse.ok("Funcionários encontrados com sucesso", shifts));
    }
}
