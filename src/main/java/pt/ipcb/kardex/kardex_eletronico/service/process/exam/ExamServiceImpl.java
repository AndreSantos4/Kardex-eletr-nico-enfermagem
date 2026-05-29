package pt.ipcb.kardex.kardex_eletronico.service.process.exam;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.*;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ResultadoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoExame;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.ExameMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.ExameRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.shift.ShiftService;
import pt.ipcb.kardex.kardex_eletronico.service.shift.issues.IssuesService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final Clock clock;

    private final ExameRepository repository;
    private final ExameMapper mapper;

    private final ProcessService processService;
    private final WorkerService workerService;
    private final ShiftService shiftService;
    private final IssuesService issuesService;

    @Transactional
    @Override
    public void createExam(Long processId, CreateExamDTO data){
        var process = processService.getValidProcess(processId);
        var medic = workerService.getAutenticatedWorker();

        var exam = mapper.fromCreate(data);
        exam.setProcessoClinico(process);
        exam.setMedico(medic);
        process.exames.add(exam);

        repository.save(exam);
    }

    @Transactional
    @Override
    public void editExam(Long examId, EditExamDTO data){
        var exam = repository.findById(examId)
                .orElseThrow(() -> EntityNotFoundException.forId(examId, "Exame"));

        if(exam.getEstado() != EstadoExame.PEDIDO_PENDENTE){
            throw new KardexException("Nao e possivel editar um exame ja marcado ou realizado");
        }

        exam.setDataPretendida(data.dataPretendida());
        exam.setIndicacaoClinica(data.indicacaoClinica());
        exam.setUrgencia(data.urgencia());
    }

    @Transactional
    @Override
    public void deleteExam(Long examId){
        var exam = repository.findById(examId)
                .orElseThrow(() -> EntityNotFoundException.forId(examId, "Exame"));

        if(exam.getEstado() != EstadoExame.PEDIDO_PENDENTE){
            throw new KardexException("Nao e possivel eliminar um exame ja marcado ou realizado");
        }

        repository.deleteById(examId);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ExameDTO> getAllExams(Long processId){
        var exams = repository.findByProcessoClinicoId(processId);

        return mapper.toDtoList(exams);
    }

    @Transactional
    @Override
    public void concludeExam(Long examId, ExamConcludeDTO data) {
        var exam = repository.findById(examId)
                .orElseThrow(() -> EntityNotFoundException.forId(examId, "Exame"));

        if(exam.getEstado() == EstadoExame.CONCLUIDO){
            throw new KardexException("Exame ja foi concluido");
        }

        var result = new ResultadoExame();
        result.setData(data.data());
        result.setResultado(data.resultado());
        result.setAtencao(data.atencao());

        if(data.atencao()){
            if(data.atencaoDescricao() == null){
                throw new KardexException("Descricao da atencao do exame deve ser especificada");
            }
            result.setAtencaoDescricao(data.atencaoDescricao());
        }

        exam.setResultado(result);
        exam.setEstado(EstadoExame.CONCLUIDO);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ExameDTO> getAllExams() {
        var exams = repository.findAllNotConcluido();
        return mapper.toDtoList(exams);
    }

    @Transactional
    @Override
    public void acceptExam(Long examId, AcceptExamDTO data) {
        var exam = repository.findById(examId)
                .orElseThrow(() -> EntityNotFoundException.forId(examId, "Exame"));
        var today = LocalDate.now(clock);

        if(data.dataPretendida().isBefore(today)){
            throw new KardexException("Data pretendida do exame deve ser maior que a data atual");
        }

        exam.setEstado(EstadoExame.AGENDADO);
        exam.setDataPretendida(data.dataPretendida());
    }

    @Transactional
    @Override
    public void markAsDone(Long examId) {
        var exam = repository.findById(examId)
                .orElseThrow(() -> EntityNotFoundException.forId(examId, "Exame"));
        var shift = shiftService.getCurrentShift();

        exam.setEstado(EstadoExame.AGUARDANDO_RESULTADO);
        issuesService.executeDefinedIssue(examId, TipoPendencia.EXAME, shift.id());
    }
}
