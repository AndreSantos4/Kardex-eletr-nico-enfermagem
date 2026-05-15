package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

public interface ProcessService {

    ProcessoClinicoDTO createProcess(Utente patient, CreateProcessDTO data);

    @Transactional(readOnly = true)
    ProcessoClinico getActiveProcess(Utente patient);

    void editActiveProcess(Utente patient, UpdatePacientFileDTO data);

    List<ProcessoClinicoDTO> getAllActiveProcesses();

    List<CamaDTO> getAllBeds(boolean occupied);

    void registerVitalSigns(Long processId, RegisterVitalSignsDTO vitalSigns);

    void dischargePatient(Long processId, DischargePatientDTO data);

    ProcessoClinicoDTO getKardexProcess(Utente patient);

    ProcessoClinico getValidProcess(Long processId);

    @Transactional(readOnly = true)
    boolean  vitalSignsInShift(Turno shift, ProcessoClinico process);
}
