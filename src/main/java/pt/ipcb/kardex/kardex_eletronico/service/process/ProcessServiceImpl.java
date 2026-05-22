package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.DischargePatientDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.InactiveResourceException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.*;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.*;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.*;
import pt.ipcb.kardex.kardex_eletronico.repository.CamaRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService{

    private final Clock clock;

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
        var carePlan = defaultCarePlan();

        process.setMedicoResponsavel(medic);
        process.setUtente(patient);
        process.setCama(bed);
        process.getPlanoCuidados().add(carePlan);
        patient.setEstado(EstadoUtente.INTERNADO);
        carePlan.setProcessoClinico(process);

        if(bed == null) {
            throw new KardexException("Cama nao pode ser nula");
        }

        bed.setOcupada(true);

        return mapper.toDTO(repository.save(process));
    }

    private PlanoCuidados defaultCarePlan() {
        var plan =  new PlanoCuidados();
        var autenticatedWorker = workerService.getAutenticatedWorker();

        var interventions = defaultInterventions();
        interventions.forEach(intervention -> intervention.setPlanoCuidados(plan));
        plan.setAutor(autenticatedWorker);
        plan.setIntervencoes(interventions);

        return plan;
    }

    private List<Intervencao>  defaultInterventions() {
        List<Intervencao> intervencoes = new ArrayList<>();
        var autenticatedWorker = workerService.getAutenticatedWorker();

        Intervencao intervencao1 = new Intervencao();
        intervencao1.setFuncionario(autenticatedWorker);
        intervencao1.setDiagnostico(IntervencaoDiagnostico.MONITORIZACAO_SINAIS_VITAIS);
        intervencao1.setIntervencao(TipoIntervencao.OUTRO);
        intervencao1.setFrequencia(FrequenciaIntervencao.DIA_4);
        intervencao1.setHorarioPrevisto("06:00 - 12:00 - 18:00 - 24:00");
        intervencao1.setPrioridade(PrioridadeIntervencao.MEDIA);
        intervencao1.setData(LocalDateTime.now(clock));

        Intervencao intervencao2 = new Intervencao();
        intervencao2.setFuncionario(autenticatedWorker);
        intervencao2.setDiagnostico(IntervencaoDiagnostico.AVALIACAO_NIVEL_DOR);
        intervencao2.setIntervencao(TipoIntervencao.OUTRO);
        intervencao2.setFrequencia(FrequenciaIntervencao.DIA_3);
        intervencao2.setHorarioPrevisto("08:00 - 20:00");
        intervencao2.setPrioridade(PrioridadeIntervencao.MEDIA);
        intervencao2.setData(LocalDateTime.now(clock));

        Intervencao intervencao3 = new Intervencao();
        intervencao3.setFuncionario(autenticatedWorker);
        intervencao3.setDiagnostico(IntervencaoDiagnostico.SUPERVISAO_CONTINUA_UTENTE);
        intervencao3.setIntervencao(TipoIntervencao.OUTRO);
        intervencao3.setFrequencia(FrequenciaIntervencao.CONTINUA);
        intervencao3.setHorarioPrevisto("Sempre");
        intervencao3.setPrioridade(PrioridadeIntervencao.MEDIA);
        intervencao3.setData(LocalDateTime.now(clock));

        Intervencao intervencao4 = new Intervencao();
        intervencao4.setFuncionario(autenticatedWorker);
        intervencao4.setDiagnostico(IntervencaoDiagnostico.GLICEMIA_CAPILAR_PRE_JANTAR);
        intervencao4.setIntervencao(TipoIntervencao.OUTRO);
        intervencao4.setFrequencia(FrequenciaIntervencao.DIA_1);
        intervencao4.setHorarioPrevisto("18:30");
        intervencao4.setPrioridade(PrioridadeIntervencao.MEDIA);
        intervencao4.setData(LocalDateTime.now(clock));

        intervencoes.add(intervencao1);
        intervencoes.add(intervencao2);
        intervencoes.add(intervencao3);
        intervencoes.add(intervencao4);

        return intervencoes;
    }

    @Transactional(readOnly = true)
    @Override
    public ProcessoClinico getActiveProcess(Utente patient){
        return repository.findByUtenteAndAltaFalse(patient)
                .orElseThrow(() -> new EntityNotFoundException("O utente com id " + patient.getId() + " nao possui nenhum processo ativo"));
    }

    @Override
    @Transactional
    public void editActiveProcess(Utente patient, UpdatePacientFileDTO data) {
        var process = getActiveProcess(patient);

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

    @Transactional(readOnly = true)
    @Override
    public boolean vitalSignsInShift(Turno shift, ProcessoClinico process) {
        return process.getSinaisVitais()
                .stream()
                .anyMatch(v -> !v.getData().isBefore(shift.getInicio())
                        && !v.getData().isAfter(shift.getFim()));
    }
}