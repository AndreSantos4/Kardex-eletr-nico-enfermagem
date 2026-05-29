package pt.ipcb.kardex.kardex_eletronico.service.process.prescription;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.MaxDoseAlertDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.administration.CreateAdministrationDTO;
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
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegistoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.AdministracaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.MedicamentoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PrescricaoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.AdministracaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
import pt.ipcb.kardex.kardex_eletronico.service.shift.issues.IssuesService;
import pt.ipcb.kardex.kardex_eletronico.service.record.ClinicRecordService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.math.BigDecimal;
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

    private final RecordService recordService;
    private final ProcessService processService;
    private final WorkerService workerService;
    private final StockService stockService;
    private final ClinicRecordService clinicRecordService;

    private final PrescricaoMapper mapper;
    private final PrescricaoRepository repository;
    private final AdministracaoMapper administracaoMapper;
    private final AdministracaoRepository administracaoRepository;
    private final IssuesService issuesService;
    private final MedicamentoMapper medicamentoMapper;

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
        clinicRecordService.createClinicRecord(process, TipoRegistoClinico.PRESCRICAO, "Prescricao registada com sucesso");
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
        clinicRecordService.createClinicRecord(prescription.getProcesso(), TipoRegistoClinico.PRESCRICAO, "Prescricao suspensa com sucesso");
    }

    @Override
    @Transactional
    public MaxDoseAlertDTO administrateMedication(Long prescriptionId, CreateAdministrationDTO data) {
        var prescription = repository.findById(prescriptionId)
                .orElseThrow(() -> EntityNotFoundException.forId(prescriptionId, "Prescrição"));
        boolean surpassedMax = false;

        if(prescription.getProcesso().getAlta()){
            throw new InactiveResourceException("Processo Clinico");
        }

        if(!prescription.getEstado().equals(PrescriptionState.ATIVA)){
            throw new InactiveResourceException("Prescricao");
        }

        if(data.validacaoMedico() != null){
            if(workerService.getMedicById(data.validacaoMedico().idMedico()) == null){
                throw EntityNotFoundException.forId(data.validacaoMedico().idMedico(), "Medico");
            };

            surpassedMax = true;
        } else if(validateMaxDose(prescription)) {
            return new MaxDoseAlertDTO(
                    medicamentoMapper.toDTO(prescription.getMedicamento(), null),
                    prescription.getMedicamento().getDosagemMaxDiaria().getDose(),
                    prescription.getDose().getDose()
            );
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

        if(!prescription.getSos()){
            issuesService.executeDefinedIssue(prescription.getId(), TipoPendencia.MEDICACAO, shift.getId());
            prescription.setUltimaAdministracao(LocalDateTime.now());
            prescription.setHoraAdministracaoPrevista(calculatePredictedAdministrationTime(prescription));
        }

        var newAdministration = administracaoRepository.save(administration);
        clinicRecordService.createClinicRecord(
                prescription.getProcesso(),
                TipoRegistoClinico.ADMINISTRACAO,
                "Administracao registada com sucesso",
                prescription.getDose().getDose().floatValue());


        if(surpassedMax){
            recordService.recordMaxDoseSurpassed(newAdministration, data.validacaoMedico());
        }

        return null;
    }

    private boolean validateMaxDose(Prescricao prescription) {
        var dose = prescription.getDose().getDose();
        var medication = prescription.getMedicamento();
        var maxDose = medication.getDosagemMaxDiaria().getDose();

        var raw = repository.sumDosesLast24h(
                LocalDateTime.now(clock).minusDays(1),
                medication.getId()
        );

        var dosesToday = raw != null ? raw : BigDecimal.ZERO;
        var tempDoses = dosesToday.add(dose);

        return tempDoses.compareTo(maxDose) <= 0;
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
