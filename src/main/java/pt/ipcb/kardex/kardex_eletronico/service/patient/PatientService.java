package pt.ipcb.kardex.kardex_eletronico.service.patient;

import java.util.List;
import java.util.Optional;

import pt.ipcb.kardex.kardex_eletronico.controller.filter.PatientState;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;

public interface PatientService {

    void createPatient(CreatePatientFileDTO data);
    long getHospitalizedPatientsCount();
    void editPatientFile(Long id, UpdatePacientFileDTO data);
    List<UtenteDTO> getAllPatients(PatientState filter2, Optional<String> filter);
    List<AlergiaDTO> getAllAlergies();
}
