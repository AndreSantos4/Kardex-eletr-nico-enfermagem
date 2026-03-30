package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.StrangeAttempDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.TentativaLoginDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.ip.IpAdressBlockDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.service.session.SessionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/sessions")
public class SessionController {

    private final SessionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessaoDTO>>> getAllActiveSessions() {
        var sessions = service.getActiveSessions();
        return ResponseEntity.ok(ApiResponse.ok("Sessões ativas obtidas com sucesso", sessions));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<?>> deleteSessionById(@PathVariable("sessionId") Long sessionId) {
        service.deleteSessionById(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Sessão eliminada com sucesso", null));
    }

    @PostMapping("/ip")
    public ResponseEntity<ApiResponse<?>> blockIp(@RequestBody IpAdressBlockDTO ip) {
        service.blockIp(ip);
        return ResponseEntity.ok(ApiResponse.ok("IP bloqueado com sucesso", null));
    }

    @DeleteMapping("/ip")
    public ResponseEntity<ApiResponse<?>> unblockIp(@RequestBody IpAdressBlockDTO ip) {
        service.unblockIp(ip);
        return ResponseEntity.ok(ApiResponse.ok("IP desbloqueado com sucesso", null));
    }

    @GetMapping("/attemps")
    public ResponseEntity<ApiResponse<List<TentativaLoginDTO>>> getLoginAttemps(@RequestParam(name = "s") Optional<Boolean> success){
        var attemps = service.getLoginAttemps(success);
        return ResponseEntity.ok(ApiResponse.ok("Tentativas de login obtidas com sucesso", attemps));
    }

    @GetMapping("/attemps/strange")
    public ResponseEntity<ApiResponse<List<StrangeAttempDTO>>> getLoginAttemps(){
        var activity = service.getStrangeActivity();
        return ResponseEntity.ok(ApiResponse.ok("Tentativas de login obtidas com sucesso", activity));
    }
}
