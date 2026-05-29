package pt.ipcb.kardex.kardex_eletronico.service.stats;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.ReportsFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CateterUsoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexReportsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoRankingDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioAtividadeDTO;

import java.util.List;

public interface StatsService {

    KardexCountsDTO getCounts(HttpServletRequest request);

    KardexReportsDTO getReports(ReportsFilter filter);

    @Transactional(readOnly = true)
    List<MedicamentoRankingDTO> getMedicationsRanking(ReportsFilter filter);

    @Transactional(readOnly = true)
    List<FuncionarioAtividadeDTO> getWorkerActivity(ReportsFilter filter);

    @Transactional(readOnly = true)
    List<CateterUsoDTO> getCateterUsage(ReportsFilter filter);
}
