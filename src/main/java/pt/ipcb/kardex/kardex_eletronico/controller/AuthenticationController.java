package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.PasswordResetRequestDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.service.auth.AuthenticationService;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> postMethodName(@RequestBody @Validated AuthenticationDTO data,
            HttpServletResponse response,
            HttpServletRequest request) {
        service.login(data, response, request);
        return ResponseEntity.ok(ApiResponse.ok("Login efetuado com successo", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody @Validated RegisterDTO data) {
        service.register(data);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador criado com sucesso", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(HttpServletResponse response) {
        service.logout(response);
        return ResponseEntity.ok(ApiResponse.ok("Logout efetuado com successo", null));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse<?>> passwordReset(@RequestBody @Validated PasswordResetRequestDTO data) {
        service.passwordReset(data);
        return ResponseEntity.ok(ApiResponse.ok("Pedido de reset de password efetuado com successo", null));
    }
}
