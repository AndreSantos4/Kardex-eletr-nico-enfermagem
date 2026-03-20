package pt.ipcb.kardex.kardex_eletronico.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pt.ipcb.kardex.kardex_eletronico.dto.authentication.AuthenticationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.LoginResponseDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.RegisterDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.security.TokenService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UtilizadorRepository repository;
    @Autowired 
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> postMethodName(@RequestBody @Validated AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.numeroMecanografico(), data.password());
        var auth = authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((Utilizador) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<Utilizador> register(@RequestBody @Validated RegisterDTO data){
        if(this.repository.findByNumeroMecanografico(data.numeroMecanografico()) != null)
            return ResponseEntity.badRequest().build();

        String passwordHash = new BCryptPasswordEncoder().encode("1234");
        Utilizador newUser = new Utilizador(data.numeroMecanografico(), passwordHash, data.role());

        repository.save(newUser);
        return ResponseEntity.ok().build();
    }
}
