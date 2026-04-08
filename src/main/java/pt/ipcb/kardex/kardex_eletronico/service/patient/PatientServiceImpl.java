package pt.ipcb.kardex.kardex_eletronico.service.patient;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.AlergiaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreateAlergyDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UtenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Alergia;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PatientFileMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.UtenteMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.AlergiaRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.UtenteRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService{

    private final UtenteRepository repository;
    private final PatientFileMapper fileMapper;
    private final UtenteMapper mapper;
    private final ProcessService processService;
    private final AlergiaRepository alergiaRepository;

    @Override
    @Transactional
    public void createPatient(CreatePatientFileDTO data) {
        var patient = fileMapper.toUtente(data);
        var process = fileMapper.toProcessDTO(data);

        patient.setAlergias(
            data.alergias()
                .stream()
                .map(this::verifyAlergy)
                .collect(Collectors.toSet())
        );

        try {
            var createdPatient = repository.save(patient);
            processService.createProcess(createdPatient, process);
        } catch (Exception e) {
            throw new ConflictEntitiesException("A nova ficha de utentes esta em conflito com uma das fichas ja exitentes em algum dos campos");
        }

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
        patient.setAlergias(
            data.alergias()
                .stream()
                .map(this::verifyAlergy)
                .collect(Collectors.toSet())
        );
        
        try {
            repository.save(patient);

            processService.editActiveProcess(patient, data);
        } catch (Exception e) {
            throw new ConflictEntitiesException("Os novos dado da ficha estao em conflito com dados ja existentes");
        }

    }

    private Alergia verifyAlergy(CreateAlergyDTO data){
        var alergy = alergiaRepository.findByNome(data.nome());

        if(alergy.isPresent()){
            return alergy.get();
        }

        var newAlergy = mapper.fromCreateAlergy(data);

        return alergiaRepository.save(newAlergy);
    }

    @Override
    public List<UtenteDTO> getAllPatients(Optional<String> filter) {
        var patients = repository.findAll();
        var activeProcesses = processService.getAllActiveProcesses();

        Map<Long, ProcessoClinicoDTO> processoByUtenteId = activeProcesses.stream()
                .collect(Collectors.toMap(p -> p.utenteId(), p -> p));

        Stream<Utente> stream = patients.stream();

        if (filter.isPresent()) {
            String f = filter.get().toLowerCase();
            stream = stream.filter(u -> {
                boolean matchesPatient = u.getNome().toLowerCase().contains(f)
                        || u.getNumeroSNS().toString().contains(f);

                ProcessoClinicoDTO processo = processoByUtenteId.get(u.getId());
                boolean matchesProcess = processo != null
                        && String.valueOf(processo.id()).contains(f);

                return matchesPatient || matchesProcess;
            });
        }

        return stream
                .map(u -> mapper.toDto(u, processoByUtenteId.get(u.getId())))
                .toList();
    }

    @Override
    public List<AlergiaDTO> getAllAlergies() {
        return mapper.toAlergiaDTOList(alergiaRepository.findAll());
    }
}