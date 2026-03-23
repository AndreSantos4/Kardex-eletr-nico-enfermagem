package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.io.Console;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.LoginResponseDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.InvalidCredentialsException;
import pt.ipcb.kardex.kardex_eletronico.exception.UserAlreadyExistsException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.security.TokenService;

@Service
@RequiredArgsConstructor
public class AuthenticationService implements IAuthenticationService {

    private static final int COOKIE_MAX_AGE = 28800;
    private static final String COOKIE_NAME = "kardex-cookie";

    private final AuthenticationManager authenticationManager;
    private final UtilizadorRepository repository;
    private final TokenService tokenService;

    @Override
    public LoginResponseDTO login(AuthenticationDTO data, HttpServletResponse response) {
        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.numeroMecanografico(), data.password());
            var auth = authenticationManager.authenticate(usernamePassword);

            var token = tokenService.generateToken((Utilizador) auth.getPrincipal());
            var cookie = createCookie(token);
            response.addCookie(cookie);

            return new LoginResponseDTO(token);
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException();
        }
    }

    @Override
    public void register(RegisterDTO data) {
        if (this.repository.findByNumeroMecanografico(data.numeroMecanografico()) != null) {
            throw new UserAlreadyExistsException(data.numeroMecanografico());
        }

        String passwordHash = new BCryptPasswordEncoder().encode("123456789");
        Utilizador newUser = new Utilizador(data, passwordHash);

        repository.save(newUser);
    }

    public Cookie createCookie(String token) {
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setMaxAge(COOKIE_MAX_AGE);
        cookie.setSecure(false);
        cookie.setHttpOnly(true);
        cookie.setPath("/");

        return cookie;
    }
}
