package pt.ipcb.kardex.kardex_eletronico.service.process.prescription;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.PrescricaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.SuspendPrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.InactiveResourceException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.*;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Periodo;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.AdministracaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PrescricaoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.AdministracaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.shift.issues.IssuesService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {
    private final int TOLERANCIA_ADMINISTRACAO_SOS_MINUTOS = 10;
    private final int TOLERANCIA_ADMINISTRACAO_MINUTOS = 30;

    private final Clock clock;

    private final ProcessService processService;
    private final WorkerService workerService;
    private final StockService stockService;

    private final PrescricaoMapper mapper;
    private final PrescricaoRepository repository;
    private final AdministracaoMapper administracaoMapper;
    private final AdministracaoRepository administracaoRepository;
    private final IssuesService issuesService;

    @Override
    @Transactional
    public void createPrescription(Long processId, CreatePrescriptionDTO data) {
        var process = processService.getValidProcess(processId);
        var medic = workerService.getAutenticatedWorker();

        var medication = stockService.getMedication(data.idMedicamento());
        var dose = getDose(data, medication);

        var prescription = mapper.fromCreate(data);

        prescription.setMedico(medic);
        prescription.setMedicamento(medication);
        prescription.setDose(dose);
        prescription.setProcesso(process);
        prescription.setHoraAdministracaoPrevista(calculatePredictedAdministrationTime(prescription));

        repository.save(prescription);
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
    public void suspendPrescription(Long prescriptionId, SuspendPrescriptionDTO data) {
        var prescription = repository.findById(prescriptionId)
                .orElseThrow(() -> EntityNotFoundException.forId(prescriptionId, "Prescricao"));

        var suspensao = new SuspensaoClinica(null, data.dataRetorno(), data.motivo(), data.observacoes());

        if(data.definitiva()){
            prescription.setEstado(PrescriptionState.SUSPENSA_DEFINITIVA);
        } else {
            prescription.setEstado(PrescriptionState.SUSPENSA_TEMPORARIA);
            if(data.dataRetorno() == null){
                throw new KardexException("Para suspensoes temporarias, e necessario especificar a data de retorno");
            }
        }

        prescription.setSuspensao(suspensao);
        repository.save(prescription);
    }

    @Override
    @Transactional
    public void administrateMedication(Long prescriptionId, CreateAdministrationDTO data) {
        var prescription = repository.findById(prescriptionId)
                .orElseThrow(() -> EntityNotFoundException.forId(prescriptionId, "Prescrição"));

        if(prescription.getProcesso().getAlta()){
            throw new InactiveResourceException("Processo Clinico");
        }

        if(!prescription.getEstado().equals(PrescriptionState.ATIVA)){
            throw new InactiveResourceException("Prescricao");
        }

        var administration = administracaoMapper.fromCreate(data);
        if(administration.getAdministrado()){
            var lastAdministration = repository.findMostRecentByPrescricao(prescriptionId);
            lastAdministration.ifPresent(administracaoMedicacao -> validateAdministrationInterval(administration, administracaoMedicacao));
        }

        var worker = workerService.getAutenticatedWorker();
        var shift = workerService.getCurrentShift(worker.getId());

        administration.setPrescricao(prescription);
        administration.setFuncionario(worker);
        administration.setTurno(shift);

        stockService.subtractFromStock(prescription.getMedicamento(), prescription.getDose().getDose());

        issuesService.executeDefinedIssue(prescription.getId(), TipoPendencia.MEDICACAO);
        prescription.setUltimaAdministracao(LocalDateTime.now());
        prescription.setHoraAdministracaoPrevista(calculatePredictedAdministrationTime(prescription));

        administracaoRepository.save(administration);
    }

    @Transactional(readOnly = true)
    protected void validateAdministrationInterval(AdministracaoMedicacao newAdministration, AdministracaoMedicacao lastAdministracaoMedicacao){
        var prescription = lastAdministracaoMedicacao.getPrescricao();
        var now = LocalDateTime.now();
        var interval = prescription.getFrequencia().getIntervaloMinHoras();

        if(newAdministration.getData().isBefore(lastAdministracaoMedicacao.getData().plusHours(interval))){
            throw new KardexException("Administracao nao registada, nao passou o intervalo minimo entre prescricoes");
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
                var administrationInLastDay = repository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(1));
                if(administrationInLastDay >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes diarias excedidas");
                }
                break;
            case Periodo.SEMANAL:
                var administrationInLastWeek = repository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(7));
                if(administrationInLastWeek >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes semanais excedidas");
                }
            case Periodo.MENSAL:
                var administrationInLastMonth = repository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(28));
                if(administrationInLastMonth >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes mensais excedidas");
                }
            case Periodo.ANUAL:
                var administrationInLastYear = repository.countByPrescricaoInLastDays(prescription.getId(), now.minusDays(365));
                if(administrationInLastYear >= prescription.getFrequencia().frequencia){
                    throw new KardexException("Administracoes anuais excedidas");
                }
        }
    }

    @Override
    public List<PrescricaoDTO> getPrescriptionHistory(Long processId, PrescriptionState state, LocalDate from, LocalDate to) {
        var prescriptions = repository.findByProcessoIdFiltered(processId, state, from, to);
        return mapper.toDTOList(prescriptions);
    }

    private LocalDateTime calculatePredictedAdministrationTime(Prescricao prescription) {
        var interval = prescription.getFrequencia().getIntervaloMinHoras();
        if(prescription.getDataInicio().isBefore(LocalDate.now(clock)) || prescription.getUltimaAdministracao() == null){
            return prescription.getDataInicio().atStartOfDay();
        }

        return prescription.getUltimaAdministracao().plusHours(interval);
    }
}
