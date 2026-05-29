package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.ReportsFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CateterUsoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexReportsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoRankingDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioAtividadeDTO;
import pt.ipcb.kardex.kardex_eletronico.service.stats.StatsService;

import java.util.List;

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

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<KardexReportsDTO>> getReports(ReportsFilter filter) {
        var reports = service.getReports(filter);
        return ResponseEntity.ok(ApiResponse.ok("Relatorios encontradas com sucesso", reports));
    }

    @GetMapping("/medications/ranking")
    public ResponseEntity<ApiResponse<List<MedicamentoRankingDTO>>> getMedicationsRanking(ReportsFilter filter) {
        var reports = service.getMedicationsRanking(filter);
        return ResponseEntity.ok(ApiResponse.ok("Relatorios encontradas com sucesso", reports));
    }

    @GetMapping("/workers/activity")
    public ResponseEntity<ApiResponse<List<FuncionarioAtividadeDTO>>> getWorkersActivity(ReportsFilter filter) {
        var activities = service.getWorkerActivity(filter);
        return ResponseEntity.ok(ApiResponse.ok("Atividade do funcionario encontrada com sucesso", activities));
    }

    @GetMapping("/cateters/usage")
    public ResponseEntity<ApiResponse<List<CateterUsoDTO>>> getCateterUsage(ReportsFilter filter){
        var usage = service.getCateterUsage(filter);
        return ResponseEntity.ok(ApiResponse.ok("Uso de cateteres encontrado com sucesso", usage));
    }
}
