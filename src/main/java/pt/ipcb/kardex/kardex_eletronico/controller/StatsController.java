package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;
import pt.ipcb.kardex.kardex_eletronico.service.stats.StatsService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/stats")
public class StatsController {

    private final StatsService service;

    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<KardexCountsDTO>> getCounts(HttpServletRequest request) {
        var counts = service.getCounts(request);
        return ResponseEntity.ok(ApiResponse.ok("Contagens encontradas com sucesso", counts));
    }
}
