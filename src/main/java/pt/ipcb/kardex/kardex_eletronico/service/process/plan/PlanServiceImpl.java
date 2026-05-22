package pt.ipcb.kardex.kardex_eletronico.service.process.plan;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateCarePlanDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.CreateInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.PlanoCuidadosDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.plan.RegisterInterventionDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PlanoCuidados;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PlanoCuidadosMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.IntervencaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PlanoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService {

    private final ProcessService processService;
    private final WorkerService workerService;

    private final PlanoCuidadosMapper planoMapper;
    private final PlanoRepository planoRepository;
    private final IntervencaoRepository intervencaoRepository;

    @Override
    public PlanoCuidados getCarePlanEntity(Long processId) {
        var process = processService.getValidProcess(processId);
        return planoRepository.findTopByProcessoClinicoOrderByVersaoDesc(process);
    }

    @Override
    public PlanoCuidadosDTO getCarePlan(Long processId) {
        var plan = getCarePlanEntity(processId);
        return planoMapper.toDTO(plan);
    }

    @Override
    @Transactional
    public void createCarePlan(Long processId, CreateCarePlanDTO data) {
        var process = processService.getValidProcess(processId);

        process.getPlanoCuidados().forEach(p -> p.setAtivo(false));

        var worker = workerService.getAutenticatedWorker();
        var plan = planoMapper.toEntity(data);

        plan.setVersao(process.getPlanoCuidados().size() + 1);
        plan.setProcessoClinico(process);
        plan.setAutor(worker);

        plan.getDiagnosticos().forEach(d -> d.setPlanoCuidados(plan));

        process.getPlanoCuidados().add(plan);
    }

    @Override
    @Transactional
    public void addIntervention(Long processId, CreateInterventionDTO data) {
        var plan = getCarePlanEntity(processId);
        var worker = workerService.getAutenticatedWorker();

        var intervention = planoMapper.toEntity(data);
        intervention.setPlanoCuidados(plan);
        intervention.setFuncionario(worker);

        plan.getIntervencoes().add(intervention);
    }

    @Override
    @Transactional
    public void registerIntervention(Long interventionId, RegisterInterventionDTO data) {
        var intervencao = intervencaoRepository.findById(interventionId)
                .orElseThrow(() -> EntityNotFoundException.forId(interventionId, "Intervencao"));
        var worker =  workerService.getAutenticatedWorker();

        if(intervencao.dataExecucao != null) {
            throw new KardexException("Intervencao ja foi executada");
        }

        if(data.data() == null){
            throw new KardexException("Data de execucao deve ser especificada");
        }

        intervencao.setDataExecucao(data.data());

        if(data.observacoes() == null){
            throw new KardexException("Observacoes de execucao deve  ser especificada");
        }

        intervencao.setObservacoesExecucao(data.observacoes());
        intervencao.setFuncionarioExecutou(worker);
    }

    @Override
    @Transactional
    public void unmarkIntervention(Long interventionId) {
        var intervencao = intervencaoRepository.findById(interventionId)
                .orElseThrow(() -> EntityNotFoundException.forId(interventionId, "Intervencao"));

        intervencao.setDataExecucao(null);
        intervencao.setObservacoesExecucao(null);
        intervencao.setFuncionarioExecutou(null);
    }
}
