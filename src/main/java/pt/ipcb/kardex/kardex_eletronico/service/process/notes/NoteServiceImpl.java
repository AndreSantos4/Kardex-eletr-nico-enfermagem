package pt.ipcb.kardex.kardex_eletronico.service.process.notes;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.note.CreateClinicNoteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.note.NotaClinicaDTO;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.NotaClinicaMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.NotaClinicaRepository;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService  {

    private final ProcessService processService;
    private final WorkerService workerService;

    private final NotaClinicaRepository repository;
    private final NotaClinicaMapper mapper;

    @Transactional
    @Override
    public void createClinicNote(Long processId, CreateClinicNoteDTO data) {
        var process = processService.getValidProcess(processId);
        var worker = workerService.getAutenticatedWorker();

        var note = mapper.fromCreate(data);
        note.setProcessoClinico(process);
        note.setMedico(worker);

        process.getNotasEvolucaoClinica().add(note);
        repository.save(note);
    }


    @Transactional(readOnly = true)
    @Override
    public List<NotaClinicaDTO> getAllClinicNotes(Long processId){
        var notes = repository.findByProcessoClinicoIdOrderByDataDesc(processId);
        return mapper.toDTOList(notes);
    }
}
