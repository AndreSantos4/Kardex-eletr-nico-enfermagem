package pt.ipcb.kardex.kardex_eletronico.service.process.exam;

import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.*;

import java.util.List;

public interface ExamService {
    @Transactional
    void createExam(Long processId, CreateExamDTO data);

    @Transactional
    void editExam(Long examId, EditExamDTO data);

    @Transactional
    void deleteExam(Long examId);

    @Transactional(readOnly = true)
    List<ExameDTO> getAllExams(Long processId);

    void concludeExam(Long examId, ExamConcludeDTO data);

    List<ExameDTO> getAllExams();

    void acceptExam(Long examId, AcceptExamDTO data);

    void markAsDone(Long examId);
}
