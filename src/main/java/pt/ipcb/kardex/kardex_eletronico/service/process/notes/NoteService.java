package pt.ipcb.kardex.kardex_eletronico.service.process.notes;

import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.note.CreateClinicNoteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.note.NotaClinicaDTO;

import java.util.List;

public interface NoteService {
    @Transactional
    void createClinicNote(Long processId, CreateClinicNoteDTO data);

    @Transactional(readOnly = true)
    List<NotaClinicaDTO> getAllClinicNotes(Long processId);
}
