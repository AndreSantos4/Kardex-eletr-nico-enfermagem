package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.LoginResponseDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.PasswordResetRequestDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.VerifyTwoFactorDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.InvalidCredentialsException;
import pt.ipcb.kardex.kardex_eletronico.exception.UserAlreadyExistsException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.repository.PasswordResetRequestRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.security.CookieService;
import pt.ipcb.kardex.kardex_eletronico.security.PasswordTokenService;
import pt.ipcb.kardex.kardex_eletronico.service.external.EmailSenderService;
import pt.ipcb.kardex.kardex_eletronico.service.record.RecordService;
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
    private final LoginAttemptService tentativaLoginService;
    private final EmailSenderService emailSenderService;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final PasswordTokenService passwordResetService;
    private final TwoFactorService twoFactorService;
    private final RecordService recordService;

    @Override
    public LoginResponseDTO login(AuthenticationDTO data, HttpServletResponse response, HttpServletRequest request) {
        var ip = request.getRemoteAddr();

        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(
                    data.numeroMecanografico(), data.password());
            var auth = authenticationManager.authenticate(usernamePassword);
            var utilizador = (Utilizador) auth.getPrincipal();
            
            twoFactorService.enviarCodigo(utilizador);

            return new LoginResponseDTO(true);
        } catch (BadCredentialsException e) {
            tentativaLoginService.registar(Long.parseLong(data.numeroMecanografico()), ip, false, "Credenciais inválidas");
            throw new InvalidCredentialsException();
        }
    }

    @Override
    @Transactional
    public void register(RegisterDTO data) {
        if (this.repository.findByNumeroMecanografico(data.numeroMecanografico()) != null) {
            throw new UserAlreadyExistsException(data.numeroMecanografico());
        }

        String passwordHash = new BCryptPasswordEncoder().encode("123456789");
        Utilizador user = new Utilizador(data, passwordHash);

        try {
            var newUser = repository.save(user);

            if (newUser.getRole() != Role.ADMIN) {
                workerService.createWorkerByUser(newUser);
                recordService.recordUserRegistration(newUser, true);
            } else {
                recordService.recordUserRegistration(newUser, false);
            }

            passwordReset(new PasswordResetRequestDTO(newUser.getNumeroMecanografico().toString()));

        } catch (Exception e) {
            throw new ConflictEntitiesException("Conflito com outros utilizadores existentes em um dos campos preenchidos");
        }
    }

    @Override
    @Transactional
    public void logout(HttpServletResponse response) {
        var user = (Utilizador) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        user.setDataUltimaAtividade(LocalDateTime.now());

        sessionService.delete(user);

        Cookie cookie = new Cookie("kardex-cookie", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        recordService.recordUserLogout(user);
    }

    @Override
    public LoginResponseDTO verify2FA(VerifyTwoFactorDTO data, HttpServletResponse response, HttpServletRequest request) {
        var ip = request.getRemoteAddr();
        Utilizador utilizador = (Utilizador) repository.findByNumeroMecanografico(data.numeroMecanografico());
        twoFactorService.verificarCodigo(utilizador, data.codigo());

        sessionService.createOrUpdate(utilizador, ip);
        tentativaLoginService.registar(data.numeroMecanografico(), ip, true, null);

        var token = tokenService.generateToken(utilizador);
        response.addCookie(createCookie(token, COOKIE_MAX_AGE));

        recordService.recordUserLogin(utilizador);

        return new LoginResponseDTO(false);
    }

    private Cookie createCookie(String token, int age) {
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setMaxAge(age);
        cookie.setSecure(false);
        cookie.setHttpOnly(true);
        cookie.setPath("/");

        return cookie;
    }

    @Override
    @Transactional
    public void passwordReset(PasswordResetRequestDTO data) {
        var request = passwordResetService.generatePasswordRequest(data);

        passwordResetRequestRepository.save(request);

        var user = (Utilizador) repository.findByNumeroMecanografico(Long.parseLong(data.numeroMecanografico()));
        emailSenderService.sendPasswordResetEmail(user, request.getTokenUUID());

        recordService.recordPasswordResetRequest(user);
    }
}
