package pt.ipcb.kardex.kardex_eletronico.service.process.prescription;

import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.PrescricaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.SuspendPrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;

import java.time.LocalDate;
import java.util.List;

public interface PrescriptionService {

    void createPrescription(Long processId, CreatePrescriptionDTO data);

    void suspendPrescription(Long prescriptionId, SuspendPrescriptionDTO data);

    void administrateMedication(Long prescriptionId, CreateAdministrationDTO data);

    List<PrescricaoDTO> getPrescriptionHistory(Long processId, PrescriptionState state, LocalDate from, LocalDate to);
}
