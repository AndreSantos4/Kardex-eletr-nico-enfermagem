package pt.ipcb.kardex.kardex_eletronico.service.process;

import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;

public interface ProcessService {

    void createPrescription(Long processId, CreatePrescriptionDTO data);

}
