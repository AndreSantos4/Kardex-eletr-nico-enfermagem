package pt.ipcb.kardex.kardex_eletronico.controller.integrations;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.ipcb.kardex.kardex_eletronico.controller.Process.ExamController;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.AcceptExamDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.ExamConcludeDTO;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExamIntegrationSimulator {

    private final Clock clock;

    private static final int SEND_EXAMS_RESULTS_RATE = 24 * 60 * 60 * 1000;

    private final ExamController examController;

    @Scheduled(fixedRate = SEND_EXAMS_RESULTS_RATE)
    private void setSendExamsResults(){
        var exams = examController.getAllUnconcludedExams().getBody().getData();
        exams.forEach(e -> {
            switch (e.estado()) {
                case PEDIDO_PENDENTE -> {
                    examController.acceptExam(e.id(), new AcceptExamDTO(generateExamDate()));
                    log.info("Exame {} agendado para {}", e.id(), e.dataPretendida());
                }
                case AGENDADO -> {
                    var today = LocalDate.now(clock);
                    if(e.dataPretendida().equals(today) || e.dataPretendida().isAfter(today)){
                        examController.markAsDone(e.id());
                    }
                    log.info("Exame {} marcado como realizado", e.id());
                }
                case AGUARDANDO_RESULTADO -> {
                    boolean random = ThreadLocalRandom.current().nextBoolean();
                    examController.concludeExam(
                            e.id(),
                            new ExamConcludeDTO(
                                    "Resultado simulado pela integracao",
                                    random,
                                    random ? "Atencao simulado pela integracao" : null,
                                    LocalDate.now(clock)
                            )
                    );
                    log.info("Resultados do exame {} obtidos com successo", e.id());
                }
            }
        });
    }

    private LocalDate generateExamDate(){
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusMonths(1);

        long daysBetween = ChronoUnit.DAYS.between(start, end);
        return start.plusDays(ThreadLocalRandom.current().nextLong(daysBetween));
    }
}
