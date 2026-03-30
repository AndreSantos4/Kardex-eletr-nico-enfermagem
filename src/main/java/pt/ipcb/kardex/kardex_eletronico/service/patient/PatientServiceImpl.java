package pt.ipcb.kardex.kardex_eletronico.service.patient;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.ProcessoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.UtenteMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.UtenteRepository;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService{

    private final UtenteRepository repository;
    private final ProcessoClinicoRepository processoRepository;
    private final UtenteMapper mapper;
    private final ProcessoMapper processoMapper;

    @Override
    @Transactional
    public void createPatient(CreatePatientDTO data) {
        var patient = mapper.fromCreate(data);
        repository.save(patient);
    }

    @Override
    @Transactional
    public void createProcess(Long patientId, CreateProcessDTO data) {
        var patient = repository.findById(patientId)
            .orElseThrow(() -> EntityNotFoundException.forId(patientId, "Utente"));
        
        var process = processoMapper.fromCreate(data);

        process.setUtente(patient);
        patient.setEstado(EstadoUtente.INTERNADO);

        processoRepository.save(process);
        repository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public long getHospitalizedPatientsCount() {
        return repository.countByEstado(EstadoUtente.INTERNADO);
    }
}
