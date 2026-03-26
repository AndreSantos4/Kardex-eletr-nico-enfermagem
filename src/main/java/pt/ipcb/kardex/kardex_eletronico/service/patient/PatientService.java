package pt.ipcb.kardex.kardex_eletronico.service.patient;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;

public interface PatientService {

    void createPatient(CreatePatientDTO data);

    void createProcess(Long patientId, CreateProcessDTO data);

}
