package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.time.LocalDate;
import java.util.List;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.PrescricaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.SuspendPrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;

public interface ProcessService {

    public ProcessoClinicoDTO createProcess(Utente patient, CreateProcessDTO data);

    void createPrescription(Long processId, CreatePrescriptionDTO data);

    void administrateMedication(Long prescriptionId, CreateAdministrationDTO data);

    List<PrescricaoDTO> getPrescriptionHistory(Long processId, PrescriptionState state, LocalDate from, LocalDate to);

    void editActiveProcess(Utente patient, UpdatePacientFileDTO data);

    List<ProcessoClinicoDTO> getAllActiveProcesses();

    List<CamaDTO> getAllBeds(boolean occupied);

    public void registerVitalSigns(Long processId, RegisterVitalSignsDTO vitalSigns);

    public void dischargePatient(Long processId, DischargePatientDTO data);

    public ProcessoClinicoDTO getKardexProcess(Utente patient);

    public void suspendPrescription(Long prescriptionId, SuspendPrescriptionDTO data);

    public void createCarePlan(Long processId, CreateCarePlanDTO data);

    public PlanoCuidadosDTO getCarePlan(Long processId);
}
