package pt.ipcb.kardex.kardex_eletronico.controller.integrations;

import java.math.BigDecimal;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import pt.ipcb.kardex.kardex_eletronico.controller.StockController;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.StockChangeDTO;

@Slf4j
@Component
@RequiredArgsConstructor
public class PharmacyIntegrationSimulator{

    private static final int RESTOCK_RATE_MILISECONDS = 24 * 60 * 60 * 1000;

    private final StockController stockController;

    @Scheduled(fixedRate = RESTOCK_RATE_MILISECONDS)
    private void restockEverything(){
        var medications = stockController.getAllMedications().getBody().getData();

        medications.forEach(m -> {
            if(m.active()){
                BigDecimal quantity = BigDecimal.valueOf((Math.random() * 9000) + 1000);
                stockController.recordStockChange(m.id(), new StockChangeDTO(quantity));

                log.info("Mudanca de stock registada pro medicamento {} com novo lote de {}{}", 
                    m.nome(), quantity.floatValue(), m.dosagemMaxDiaria().unidadeMedida());
            }
        });
    }
}