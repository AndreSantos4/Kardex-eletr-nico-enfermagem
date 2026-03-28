package pt.ipcb.kardex.kardex_eletronico.service.process;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;

public interface ProcessService {

    void createPrescription(Long processId, CreatePrescriptionDTO data);

    void administrateMedication(Long prescriptionId, CreateAdministrationDTO data, HttpServletRequest request);

}
