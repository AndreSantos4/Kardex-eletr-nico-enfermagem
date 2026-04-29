package pt.ipcb.kardex.kardex_eletronico.service.process;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.RegisterVitalSignsDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.patient.UpdatePacientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
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
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Periodo;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.AdministracaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PrescricaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.ProcessoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.AdministracaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.CamaRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService{
    private final int TOLERANCIA_ADMINISTRACAO_SOS_MINUTOS = 10;
    private final int TOLERANCIA_ADMINISTRACAO_MINUTOS = 30;

    private final ProcessoClinicoRepository repository;
    private final ProcessoMapper mapper;
    private final PrescricaoMapper prescricaoMapper;
    private final PrescricaoRepository prescricaoRepository;
    private final AdministracaoRepository administracaoRepository;
    private final AdministracaoMapper administracaoMapper;
    private final WorkerService workerService;
    private final CamaRepository camaRepository;
    private final RecordService recordService;
    private final StockService stockService;

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
    public void createPrescription(Long processId, CreatePrescriptionDTO data) {
        var process = getValidProcess(processId);
            
        var medication = stockService.getMedication(data.idMedicamento());
        var dose = getDose(data, medication);

        var prescription = prescricaoMapper.fromCreate(data);
    
        prescription.setMedicamento(medication);
        prescription.setDose(dose);

        prescription.setProcesso(process);
        
        prescricaoRepository.save(prescription);
    }

	private Dosagem getDose(CreatePrescriptionDTO data, Medicamento medication) {
		var dose = medication.getDosagens()
            .stream()
            .filter(d -> d.getId().equals(data.idDose()))
            .toList();
        
        if(dose.isEmpty()) {
            throw new KardexException("Este medicamento nao possui esta dose");
        }
        
        return dose.getFirst();
	}

        @Override
    @Transactional
    public void administrateMedication(Long prescriptionId, CreateAdministrationDTO data) {
        var prescription = prescricaoRepository.findById(prescriptionId)
            .orElseThrow(() -> EntityNotFoundException.forId(prescriptionId, "Prescrição"));

        if(prescription.getProcesso().getAlta()){
            throw new InactiveResourceException("Processo Clinico");
        }

        var administration = administracaoMapper.fromCreate(data);
        if(administration.getAdministrado()){
            var lastAdministration = prescricaoRepository.findMostRecentByPrescricao(prescriptionId);
            if(lastAdministration.isPresent()){
                validateAdministrationInterval(administration, lastAdministration.get());
            }
        }

        var worker = workerService.getAutenticatedWorker();
        var shift = workerService.getCurrentShift(worker.getId());

        administration.setPrescricao(prescription);
        administration.setFuncionario(worker);
        administration.setTurno(shift);

        administracaoRepository.save(administration);
    }

    private void validateAdministrationInterval(AdministracaoMedicacao newAdministration, AdministracaoMedicacao lastAdministracaoMedicacao){
        var prescription = lastAdministracaoMedicacao.getPrescricao();
        var now = LocalDateTime.now();
        var interval = prescription.getFrequencia().getIntervaloMinHoras();

        if(newAdministration.getData().isBefore(lastAdministracaoMedicacao.getData().plusHours(interval))){
            throw new KardexException("Administracao nao registad, nao passou o intervalo minimo entre prescricoes");
        }

        if(prescription.getSos()){
            if(newAdministration.getData().isBefore(lastAdministracaoMedicacao.getData().plusHours(interval + TOLERANCIA_ADMINISTRACAO_SOS_MINUTOS / 60))){
                newAdministration.setAdministrado(false);
                return;
            }
        } else {
            if(newAdministration.getData().isBefore(lastAdministracaoMedicacao.getData().plusHours(interval + TOLERANCIA_ADMINISTRACAO_MINUTOS / 60))){
                newAdministration.setAdministrado(false);
                return;
            }
        } 
        
        switch (prescription.getFrequencia().getPeriodo()) {
            case Periodo.DIARIO:
                var administrationInLastDay = prescricaoRepository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(1));
                if(administrationInLastDay >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes diarias excedidas");
                }
                break;
            case Periodo.SEMANAL:
                var administrationInLastWeek = prescricaoRepository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(7));
                if(administrationInLastWeek >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes semanais excedidas");
                }
            case Periodo.MENSAL: 
                var administrationInLastMonth = prescricaoRepository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(28));
                if(administrationInLastMonth >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes mensais excedidas");
                }
            case Periodo.ANUAL:
                var administrationInLastYear = prescricaoRepository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(365));
                if(administrationInLastYear >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes anuais excedidas");
                }
        }
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
    
   	private ProcessoClinico getValidProcess(Long processId) {
		var process = repository.findById(processId)
               .orElseThrow(() -> EntityNotFoundException.forId(processId, "Processo"));
   
        if(process.getAlta()){
               throw new InactiveResourceException("Processo Clinico");
        }
		return process;
	}

    @Override
    public ProcessoClinicoDTO getKardexProcess(Utente patient) {
        var process = repository.findKardexProcess(patient.getId()).orElse(null);
        return mapper.toDTO(process);
    }
}