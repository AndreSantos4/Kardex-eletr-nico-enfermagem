package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.time.LocalDate;
import java.util.List;

import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CateterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.ContencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateCateterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateContencaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateIncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.IncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.PrescricaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.SuspendPrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PlanoCuidados;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;

public interface ProcessService {

    ProcessoClinicoDTO createProcess(Utente patient, CreateProcessDTO data);

    void editActiveProcess(Utente patient, UpdatePacientFileDTO data);

    List<ProcessoClinicoDTO> getAllActiveProcesses();

    List<CamaDTO> getAllBeds(boolean occupied);

    void registerVitalSigns(Long processId, RegisterVitalSignsDTO vitalSigns);

    void dischargePatient(Long processId, DischargePatientDTO data);

    ProcessoClinicoDTO getKardexProcess(Utente patient);

    ProcessoClinico getValidProcess(Long processId);
}
