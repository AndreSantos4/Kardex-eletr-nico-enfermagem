package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

public interface ProcessService {

    public void createProcess(Utente patient, CreateProcessDTO data);

    void createPrescription(Long processId, CreatePrescriptionDTO data);

    void administrateMedication(Long prescriptionId, CreateAdministrationDTO data, HttpServletRequest request);

    public void editActiveProcess(Utente patient, UpdatePacientFileDTO data);

    public List<ProcessoClinicoDTO> getAllActiveProcesses();

}
