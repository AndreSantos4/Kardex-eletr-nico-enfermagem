package pt.ipcb.kardex.kardex_eletronico.service.patient;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;

public interface PatientService {

    void createPatient(CreatePatientFileDTO data);
    long getHospitalizedPatientsCount();
}
