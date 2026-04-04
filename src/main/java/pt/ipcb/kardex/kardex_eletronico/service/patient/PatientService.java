package pt.ipcb.kardex.kardex_eletronico.service.patient;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;

public interface PatientService {

    void createPatient(CreatePatientFileDTO data);
    long getHospitalizedPatientsCount();
    void editPatientFile(Long id, UpdatePacientFileDTO data);
}
