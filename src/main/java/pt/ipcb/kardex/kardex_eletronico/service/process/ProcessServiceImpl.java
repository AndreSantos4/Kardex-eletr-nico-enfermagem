package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
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
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.InactiveResourceException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AdministracaoMedicacao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Dosagem;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.SuspensaoClinica;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.*;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Periodo;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.*;
import pt.ipcb.kardex.kardex_eletronico.repository.AdministracaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.CamaRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PlanoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService{

    private final ProcessoClinicoRepository repository;
    private final ProcessoMapper mapper;
    private final WorkerService workerService;
    private final CamaRepository camaRepository;
    private final RecordService recordService;

    @Override
    @Transactional
    public ProcessoClinicoDTO createProcess(Utente patient, CreateProcessDTO data) {        
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

        if(bed == null) {
            throw new KardexException("Cama nao pode ser nula");
        }

        bed.setOcupada(true);

        return mapper.toDTO(repository.save(process));
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
            
            if(previousBed != null){
                previousBed.setOcupada(false);
            }

            process.setCama(bed);

            if(bed != null){
                bed.setOcupada(true);
            }
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
    public void registerVitalSigns(Long processId, RegisterVitalSignsDTO vitalSigns) {
        var process = getValidProcess(processId);

        var vitalSign = mapper.fromVitalSignRegister(vitalSigns);
        vitalSign.setProcessoClinico(process);
        vitalSign.setFuncionario(workerService.getAutenticatedWorker());
        process.getSinaisVitais().add(vitalSign);

        repository.save(process);
    }

    @Override
    @Transactional
    public void dischargePatient(Long processId, DischargePatientDTO data) {
        var process = getValidProcess(processId);

        process.setAlta(true);
        process.setNotasAlta(data.notasAlta());
        process.setDataSaida(data.data());
        process.getUtente().setEstado(EstadoUtente.INATIVO);

        repository.save(process);
        
        recordService.recordPatientDischarge(mapper.toDTO(process));
    }

    @Override
   	public ProcessoClinico getValidProcess(Long processId) {
		var process = repository.findById(processId)
               .orElseThrow(() -> EntityNotFoundException.forId(processId, "Processo"));
   
        if(process.getAlta()){
               throw new InactiveResourceException("Processo Clinico");
        }
		return process;
	}

    @Override
    @Transactional(readOnly = true)
    public ProcessoClinicoDTO getKardexProcess(Utente patient) {
        var process = repository.findKardexProcess(patient.getId()).orElse(null);
        return mapper.toDTO(process);
    }
}