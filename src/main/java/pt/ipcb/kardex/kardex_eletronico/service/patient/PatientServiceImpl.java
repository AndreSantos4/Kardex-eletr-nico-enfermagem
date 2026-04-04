package pt.ipcb.kardex.kardex_eletronico.service.patient;

import java.util.HashSet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PatientFileMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.UtenteRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService{

    private final UtenteRepository repository;
    private final PatientFileMapper fileMapper;
    private final ProcessService processService;

    @Override
    @Transactional
    public void createPatient(CreatePatientFileDTO data) {
        var patient = fileMapper.toUtente(data);
        var process = fileMapper.toProcessDTO(data);

        var createdPatient = repository.save(patient);

        processService.createProcess(createdPatient, process);
    }

    @Override
    @Transactional(readOnly = true)
    public long getHospitalizedPatientsCount() {
        return repository.countByEstado(EstadoUtente.INTERNADO);
    }

    @Override
    public void editPatientFile(Long id, UpdatePacientFileDTO data) {
        var patient = repository.findById(id)
            .orElseThrow(() -> EntityNotFoundException.forId(id, "Utente"));

        patient.setNome(data.nome());
        patient.setDataNascimento(data.dataNascimento());
        patient.setSexo(data.sexo());
        patient.setNumeroCC(data.numeroCC());
        patient.setNumeroSNS(data.numeroSNS());
        
        repository.save(patient);

        processService.editActiveProcess(patient, data);
    }
}
