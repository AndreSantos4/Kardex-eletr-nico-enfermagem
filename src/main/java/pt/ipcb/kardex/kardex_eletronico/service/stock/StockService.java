package pt.ipcb.kardex.kardex_eletronico.service.stock;

import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;

public interface StockService {

    void addMedication(CreateMedicationDTO data);

}
