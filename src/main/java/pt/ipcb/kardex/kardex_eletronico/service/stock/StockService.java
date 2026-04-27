package pt.ipcb.kardex.kardex_eletronico.service.stock;

import java.util.List;

import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;

public interface StockService {

    void addMedication(CreateMedicationDTO data);
    long getMedicationsCount();
    List<MedicamentoDTO> getAllMedications();
    void editMedication(Long medicationId, CreateMedicationDTO data);
    void deactivateMedication(Long medicationId);
	void activateMedication(Long medicationId);
	Medicamento getMedication(Long medicationId);
}
