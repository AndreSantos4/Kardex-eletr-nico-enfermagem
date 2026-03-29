package pt.ipcb.kardex.kardex_eletronico.service.user;

import java.util.List;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.OrderBy;
import pt.ipcb.kardex.kardex_eletronico.dto.user.ChangeUserPasswordDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UpdateUserDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;

public interface UserService {
    List<UtilizadorDTO> getAllUsers(Optional<String> filter, OrderBy orderBy);
    void updateUser(Long id, UpdateUserDTO data);
    UtilizadorDTO getUserById(Long id);
    UtilizadorDTO getUserByToken(HttpServletRequest request);
    void deactivateUser(Long id);
    void activateUser(Long id);
    void changePassword(Long id, String token, ChangeUserPasswordDTO newPassword);
    long getActiveUsersCount();
}
