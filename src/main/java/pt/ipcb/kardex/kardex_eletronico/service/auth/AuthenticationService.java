package pt.ipcb.kardex.kardex_eletronico.service.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.LoginResponseDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.PasswordResetRequestDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.VerifyTwoFactorDTO;

public interface AuthenticationService {

    LoginResponseDTO login(AuthenticationDTO data, HttpServletResponse response, HttpServletRequest request);
    void register(RegisterDTO data);
    void logout(HttpServletResponse response);
    void passwordReset(PasswordResetRequestDTO data);
    public LoginResponseDTO verify2FA(VerifyTwoFactorDTO data, HttpServletResponse response, HttpServletRequest request);
}