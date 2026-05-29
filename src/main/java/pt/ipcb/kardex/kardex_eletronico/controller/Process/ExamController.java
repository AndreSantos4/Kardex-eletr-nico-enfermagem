package pt.ipcb.kardex.kardex_eletronico.controller.Process;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.*;
import pt.ipcb.kardex.kardex_eletronico.service.process.exam.ExamService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class ExamController {

    private final ExamService service;

    @PostMapping("/{processId}/exams")
    public ResponseEntity<ApiResponse<?>> createExam(@PathVariable Long processId, @RequestBody CreateExamDTO data){
        service.createExam(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Exame criado com sucesso", null));
    }

    @PatchMapping("/exams/{examId}")
    public ResponseEntity<ApiResponse<?>> editExam(@PathVariable Long examId, @RequestBody EditExamDTO data){
        service.editExam(examId, data);
        return ResponseEntity.ok(ApiResponse.ok("Exame editado com sucesso", null));
    }

    @DeleteMapping("/exams/{examId}")
    public ResponseEntity<ApiResponse<?>> deleteExam(@PathVariable Long examId){
        service.deleteExam(examId);
        return ResponseEntity.ok(ApiResponse.ok("Exame eliminado com sucesso", null));
    }

    @GetMapping("/{processId}/exams")
    public ResponseEntity<ApiResponse<List<ExameDTO>>> getExams(@PathVariable Long processId){
        var exams = service.getAllExams(processId);
        return ResponseEntity.ok(ApiResponse.ok("Exames obtidos com sucesso", exams));
    }

    @PatchMapping("/exams/{examId}/conclude")
    public ResponseEntity<ApiResponse<?>> concludeExam(@PathVariable Long examId, @RequestBody ExamConcludeDTO data){
        service.concludeExam(examId, data);
        return ResponseEntity.ok(ApiResponse.ok("Exame concluido com sucesso", null));
    }

    @GetMapping("/exams")
    public ResponseEntity<ApiResponse<List<ExameDTO>>> getAllUnconcludedExams(){
        var exams = service.getAllExams();
        return ResponseEntity.ok(ApiResponse.ok("Exames obtidos com sucesso", exams));
    }

    @PatchMapping("/exams/{examId}/mark-as-done")
    public ResponseEntity<ApiResponse<?>> markAsDone(@PathVariable Long examId) {
        service.markAsDone(examId);
        return ResponseEntity.ok(ApiResponse.ok("Exame marcado como concluido com sucesso", null));
    }

    @PatchMapping("/exams/{examId}/accept")
    public ResponseEntity<ApiResponse<?>> acceptExam(@PathVariable Long examId, @RequestBody AcceptExamDTO data) {
        service.acceptExam(examId, data);
        return ResponseEntity.ok(ApiResponse.ok("Exame aceite com sucesso", null));
    }
}
