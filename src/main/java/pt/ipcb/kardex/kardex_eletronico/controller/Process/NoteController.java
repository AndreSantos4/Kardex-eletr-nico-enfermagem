package pt.ipcb.kardex.kardex_eletronico.controller.Process;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.note.CreateClinicNoteDTO;
import pt.ipcb.kardex.kardex_eletronico.service.process.notes.NoteService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/processes")
public class NoteController {

    private final NoteService service;

    @PostMapping("/{processId}/notes")
    public ResponseEntity<ApiResponse<?>> createClinicNote(@PathVariable Long processId, @RequestBody CreateClinicNoteDTO data){
        service.createClinicNote(processId, data);
        return ResponseEntity.ok(ApiResponse.ok("Nota de evolucao clinica criada com sucesso", null));
    }

    @GetMapping("/{processId}/notes")
    public ResponseEntity<ApiResponse<?>> getNotes(@PathVariable Long processId){
        var notes = service.getAllClinicNotes(processId);
        return ResponseEntity.ok(ApiResponse.ok("Notas de evolucao clinica obtidas com sucesso", notes));
    }
}
