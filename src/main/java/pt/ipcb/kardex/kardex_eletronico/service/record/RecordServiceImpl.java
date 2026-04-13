package pt.ipcb.kardex.kardex_eletronico.service.record;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Registo;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.NivelRegisto;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegisto;
import pt.ipcb.kardex.kardex_eletronico.repository.RegistoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final RegistoRepository repository;
    private final WorkerService workerService;

    @Override
    @Transactional
    public void recordPatientAcceptance(ProcessoClinicoDTO process, boolean newProcess, HttpServletRequest request) {
        var record = new Registo(
            null, 
            workerService.getAutenticatedWorker(request).getDados(),
            NivelRegisto.INFO,
            TipoRegisto.PATIENT_ACCEPTANCE, 
            "processo_clinico&utente", 
            String.format("O processo clinico numero %d foi aberto para o utente de id %d", process.id(), process.utenteId()), 
            null, 
            LocalDateTime.now()
        );

        if(newProcess){
            record.setDetalhes("E o primeiro processo associado ao cliente");
        }
        else{
            record.setDetalhes("O utente ja possuia um ou mais processos a ele associado");
        }

        repository.save(record);
    }

    @Override
    @Transactional
    public void recordPatientDischarge(ProcessoClinicoDTO process, HttpServletRequest request) {
        var record = new Registo(
            null, 
            workerService.getAutenticatedWorker(request).getDados(), 
            NivelRegisto.INFO, 
            TipoRegisto.PATIENT_DISCHARGE, 
            "processo_clinico&utente", 
            String.format("O processo clinico numero %d foi finalizado, e o utente de id %d foi liberado", process.id(), process.utenteId()), 
            "n/a",
            LocalDateTime.now()
        );

        repository.save(record);
    }

    @Override
    public long getAcceptedPatientsCountToday() {
        var after = LocalDateTime.now().minusHours(24);
        return repository.countByTipoRegistoAndStampAfter(TipoRegisto.PATIENT_ACCEPTANCE, after);
    }

    @Override
    public long getDischargedPatientsCountToday() {
        var after = LocalDateTime.now().minusHours(24);
        return repository.countByTipoRegistoAndStampAfter(TipoRegisto.PATIENT_DISCHARGE, after);
    }
}
