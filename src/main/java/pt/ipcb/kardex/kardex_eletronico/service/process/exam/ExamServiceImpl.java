package pt.ipcb.kardex.kardex_eletronico.service.process.exam;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.CreateExamDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.EditExamDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.ExameDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoExame;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.ExameMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.ExameRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExameRepository repository;
    private final ExameMapper mapper;

    private final ProcessService processService;
    private final WorkerService workerService;

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

        exam.setDataPretendida(data.dataPrentendida());
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
}
