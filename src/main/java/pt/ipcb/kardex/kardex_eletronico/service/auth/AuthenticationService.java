package pt.ipcb.kardex.kardex_eletronico.service.auth;

import jakarta.servlet.http.HttpServletResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.LoginResponseDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;

public interface AuthenticationService {

    LoginResponseDTO login(AuthenticationDTO data, HttpServletResponse response);
    void register(RegisterDTO data);
    void logout(HttpServletResponse response);
}