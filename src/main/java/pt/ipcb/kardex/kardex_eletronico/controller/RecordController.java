package pt.ipcb.kardex.kardex_eletronico.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.RecordFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.util.Pagination;
import pt.ipcb.kardex.kardex_eletronico.service.record.ClinicRecordService;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/records")
public class RecordController {

    private final RecordService service;
    private final ClinicRecordService clinicRecordService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistoDTO>>> getRecords(Pagination pagination, RecordFilter filter){
        var records = service.getRecords(pagination, filter);
        return ResponseEntity.ok(ApiResponse.ok("Registos obtidos com sucesso", records));
    }

    @GetMapping("/clinic")
    public ResponseEntity<ApiResponse<List<RegistoClinicoDTO>>> getAllClinicRecords(){
        var records = clinicRecordService.getAllRecords();
        return ResponseEntity.ok(ApiResponse.ok("Registos obtidos com sucesso", records));
    }
}
