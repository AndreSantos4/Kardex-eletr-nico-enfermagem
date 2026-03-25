package pt.ipcb.kardex.kardex_eletronico.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UpdateUserDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.service.IUserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/users")
public class UserController {

    private final IUserService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UtilizadorDTO>>> getAllUsers(@RequestParam("f") Optional<String> filter, 
                                                                        @RequestParam(name = "o", defaultValue = "NAME_DESC") OrderBy orderBy) {
        var users = service.getAllUsers(filter, orderBy);
        return ResponseEntity.ok(ApiResponse.ok("Utilizadores encontrados com sucesso", users));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UtilizadorDTO>> getCurrentUser(HttpServletRequest request) {
        UtilizadorDTO user = service.getUserByToken(request);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador encontrado com sucesso", user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UtilizadorDTO>> getUserById(@PathVariable Long id) {
        UtilizadorDTO user = service.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador encontrado com sucesso", user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable Long id, @RequestBody UpdateUserDTO data) {
        service.updateUser(id, data);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador atualizado com sucesso", null));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<?>> activateUser(@PathVariable Long id) {
        service.activateUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador ativado com sucesso", null));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<?>> deactivateUser(@PathVariable Long id, @RequestBody String reason) {
        service.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Utilizador desativado com sucesso", null));
    }
}
