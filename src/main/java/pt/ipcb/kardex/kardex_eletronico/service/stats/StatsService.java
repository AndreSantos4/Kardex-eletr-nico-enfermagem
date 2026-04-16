package pt.ipcb.kardex.kardex_eletronico.service.stats;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.stats.KardexCountsDTO;

public interface StatsService {

    KardexCountsDTO getCounts(HttpServletRequest request);
}
