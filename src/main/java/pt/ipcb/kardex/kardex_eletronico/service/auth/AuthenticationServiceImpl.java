package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.LoginResponseDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictFieldsException;
import pt.ipcb.kardex.kardex_eletronico.exception.InvalidCredentialsException;
import pt.ipcb.kardex.kardex_eletronico.exception.UserAlreadyExistsException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.security.CookieService;
import pt.ipcb.kardex.kardex_eletronico.service.session.SessionService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private static final int COOKIE_MAX_AGE = 28800;
    private static final String COOKIE_NAME = "kardex-cookie";

    private final AuthenticationManager authenticationManager;
    private final UtilizadorRepository repository;
    private final CookieService tokenService;
    private final WorkerService workerService;
    private final SessionService sessionService;

    @Override
    public LoginResponseDTO login(AuthenticationDTO data, HttpServletResponse response, HttpServletRequest request) {
        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.numeroMecanografico(), data.password());
            var auth = authenticationManager.authenticate(usernamePassword);
            var user = (Utilizador) auth.getPrincipal();
            var token = tokenService.generateToken(user);
            var cookie = createCookie(token, COOKIE_MAX_AGE);

            user.setDataUltimaAtividade(LocalDateTime.now());

            response.addCookie(cookie);

            sessionService.createOrUpdate(user, request.getRemoteAddr());

            return new LoginResponseDTO(token);
        } catch (BadCredentialsException | InternalAuthenticationServiceException e) {
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

        try {
            repository.save(newUser);

            if (newUser.getRole() != Role.ADMIN) {
                workerService.createWorkerByUser(newUser);
            }
        } catch (Exception e) {
            throw new ConflictFieldsException();
        }
    }

    @Override
    public void logout(HttpServletResponse response) {
        var user = (Utilizador) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        user.setDataUltimaAtividade(LocalDateTime.now());

        sessionService.delete(user);

        Cookie cookie = new Cookie("kardex-cookie", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    private Cookie createCookie(String token, int age) {
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setMaxAge(age);
        cookie.setSecure(false);
        cookie.setHttpOnly(true);
        cookie.setPath("/");

        return cookie;
    }
}
