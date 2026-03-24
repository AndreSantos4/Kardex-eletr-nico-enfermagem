package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.service.IUserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/users")
public class UserController {

    private final IUserService service;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UtilizadorDTO>> getUser(@PathVariable Long id) {
        UtilizadorDTO user = service.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador encontrado com sucesso", user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable Long id, @RequestBody UtilizadorDTO data) {
        service.updateUser(id, data);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador atualizado com sucesso", null));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<?>> patchUser(@PathVariable Long id) {
        service.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador desativado com sucesso", null));
    }
}
