package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.AdministracaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PrescricaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.ProcessoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.AdministracaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.CamaRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService{

    private final ProcessoClinicoRepository repository;
    private final ProcessoMapper mapper;
    private final MedicamentoRepository medicamentoRepository;
    private final PrescricaoMapper prescricaoMapper;
    private final PrescricaoRepository prescricaoRepository;
    private final AdministracaoRepository administracaoRepository;
    private final AdministracaoMapper administracaoMapper;
    private final WorkerService workerService;
    private final CamaRepository camaRepository;

    @Override
    @Transactional
    public void createProcess(Utente patient, CreateProcessDTO data) {        
        if(repository.existsByUtente(patient)){
            throw new ConflictEntitiesException("Este utente ja possui um processo ativo");
        }
        
        var process = mapper.fromCreate(data);
        var medic = workerService.getMedicById(data.medicoId());
        var bed = camaRepository.findById(data.camaId()).orElse(null);

        process.setMedicoResponsavel(medic);
        process.setUtente(patient);
        process.setCama(bed);
        patient.setEstado(EstadoUtente.INTERNADO);

        if(bed != null){
            bed.setOcupada(true);
        }

        repository.save(process);
    }

    @Override
    @Transactional
    public void createPrescription(Long processId, CreatePrescriptionDTO data) {
        var process = repository.findById(processId)
            .orElseThrow(() -> EntityNotFoundException.forId(processId, "Processo"));
        var medication = medicamentoRepository.findById(data.idMedicamento())
            .orElseThrow(() -> EntityNotFoundException.forId(data.idMedicamento(), "Medicamento"));

        var prescription = prescricaoMapper.fromCreate(data, medication);

        prescription.setProcesso(process);
        
        prescricaoRepository.save(prescription);
    }

    @Override
    @Transactional
    public void administrateMedication(Long prescriptionId, CreateAdministrationDTO data, HttpServletRequest request) {
        var prescription = prescricaoRepository.findById(prescriptionId)
            .orElseThrow(() -> EntityNotFoundException.forId(prescriptionId, "Prescrição"));
        var worker = workerService.getAutenticatedWorker(request);
        var shift = workerService.getCurrentShift(worker.getId());

        var administration = administracaoMapper.fromCreate(data);
        administration.setPrescricao(prescription);
        administration.setFuncionario(worker);
        administration.setTurno(shift);

        administracaoRepository.save(administration);
    }

    @Override
    @Transactional
    public void editActiveProcess(Utente patient, UpdatePacientFileDTO data) {
        var process = repository.findByUtenteAndAltaFalse(patient)
            .orElseThrow(() -> new EntityNotFoundException("O utente com id " + patient.getId() + " nao possui nenhum processo ativo"));

        var medic = workerService.getMedicById(data.medicoId());

        if(data.camaId() != null){
            var bed = camaRepository.findById(data.camaId()).orElse(null);
            var previousBed = process.getCama();
            previousBed.setOcupada(false);
            process.setCama(bed);
            bed.setOcupada(true);
        }
        
        process.setMedicoResponsavel(medic);

        repository.save(process);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessoClinicoDTO> getAllActiveProcesses() {
        return mapper.toDTOList(repository.findAllActive());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CamaDTO> getAllBeds(boolean occupied) {
        return camaRepository.findByOcupada(occupied);
    }

    @Override
    @Transactional
    public void registerVitalSigns(Long processId, RegisterVitalSignsDTO vitalSigns, HttpServletRequest request) {
        var process = repository.findById(processId)
            .orElseThrow(() -> EntityNotFoundException.forId(processId, "Process Clinico"));

        var vitalSign = mapper.fromVitalSignRegister(vitalSigns);
        vitalSign.setProcessoClinico(process);
        vitalSign.setFuncionario(workerService.getAutenticatedWorker(request));
        process.getSinaisVitais().add(vitalSign);

        repository.save(process);
    }
}
