package pt.ipcb.kardex.kardex_eletronico.service.process.exam;

import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.CreateExamDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.EditExamDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.ExameDTO;

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
}
