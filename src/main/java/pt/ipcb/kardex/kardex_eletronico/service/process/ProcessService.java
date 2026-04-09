package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

public interface ProcessService {

    public void createProcess(Utente patient, CreateProcessDTO data);

    void createPrescription(Long processId, CreatePrescriptionDTO data);

    void administrateMedication(Long prescriptionId, CreateAdministrationDTO data, HttpServletRequest request);

    void editActiveProcess(Utente patient, UpdatePacientFileDTO data);

    List<ProcessoClinicoDTO> getAllActiveProcesses();

    List<CamaDTO> getAllBeds(boolean occupied);

    public void registerVitalSigns(Long processId, RegisterVitalSignsDTO vitalSigns, HttpServletRequest request);

    public void dischargePatient(Long processId, DischargePatientDTO data);

    public ProcessoClinicoDTO getKardexProcess(Utente patient);
}
