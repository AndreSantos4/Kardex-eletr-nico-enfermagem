package pt.ipcb.kardex.kardex_eletronico.service;

import java.util.List;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UpdateUserDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;

public interface IUserService {
    List<UtilizadorDTO> getAllUsers(Optional<String> filter);
    void updateUser(Long id, UpdateUserDTO data);
    void deactivateUser(Long id);
    UtilizadorDTO getUserById(Long id);
    UtilizadorDTO getUserByToken(HttpServletRequest request);
}
