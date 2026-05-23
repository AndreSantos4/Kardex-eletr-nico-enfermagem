package pt.ipcb.kardex.kardex_eletronico.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.util.PaginationDTO;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/records")
public class RecordController {

    private final RecordService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistoDTO>>> getRecords(PaginationDTO pagination){
        var records = service.getRecords(pagination);
        return ResponseEntity.ok(ApiResponse.ok("Registos obtidos com sucesso", records));
    }
}
