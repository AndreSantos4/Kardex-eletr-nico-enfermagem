package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.service.session.SessionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/sessions")
public class SessionController {

    private final SessionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessaoDTO>>> getAllActiveSessions(){
        var sessions = service.getActiveSessions();
        return ResponseEntity.ok(ApiResponse.ok("Sessões ativas obtidas com sucesso", sessions));
    }
}
