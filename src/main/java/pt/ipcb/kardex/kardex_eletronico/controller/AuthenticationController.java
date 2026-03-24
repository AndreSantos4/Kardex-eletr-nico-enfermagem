package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.service.auth.IAuthenticationService;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthenticationController {

    private final IAuthenticationService service;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> postMethodName(@RequestBody @Validated AuthenticationDTO data,
            HttpServletResponse response) {
        service.login(data, response);
        return ResponseEntity.ok(ApiResponse.ok("Login efetuado com successo", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody @Validated RegisterDTO data) {
        service.register(data);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador criado com sucesso", null));
    }
}
