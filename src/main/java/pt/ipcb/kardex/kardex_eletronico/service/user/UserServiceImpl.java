package pt.ipcb.kardex.kardex_eletronico.service.user;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.OrderBy;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UpdateUserDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictFieldsException;
import pt.ipcb.kardex.kardex_eletronico.exception.UserNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.UtilizadorMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.security.CookieService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UtilizadorRepository repository;
    private final UtilizadorMapper mapper;
    private final CookieService cookieService;

    @Override
    public List<UtilizadorDTO> getAllUsers(Optional<String> filter, OrderBy orderBy) {
        var users = repository.findAll();

        if (filter.isPresent()) {
            String f = filter.get().toLowerCase();
            users = users.stream()
                    .filter(u -> u.getNome().toLowerCase().contains(f)
                            || u.getNumeroMecanografico().toString().toLowerCase().contains(f))
                    .toList();
        }
        
        switch (orderBy) {
            case ASC:
                users = users.stream().sorted((u1, u2) -> u2.getNome().compareTo(u1.getNome())).toList();
                break;
            case DESC:
                users = users.stream().sorted((u1, u2) -> u1.getNome().compareTo(u2.getNome())).toList();
                break;
        }

        return users.stream().map(mapper::toDTO).toList();
    }

    @Override
    public UtilizadorDTO getUserById(Long id) {
        Utilizador user = repository.findById(id)
                .orElseThrow(() -> UserNotFoundException.forId(id));

        return mapper.toDTO(user);
    }

    public UtilizadorDTO getUserByToken(HttpServletRequest request) {
        var token = cookieService.recoverCookie(request);
        var subject = cookieService.validateToken(token);

        var user = (Utilizador) repository.findByNumeroMecanografico(subject);

        return mapper.toDTO(user);
    }

    @Override
    public void updateUser(Long id, UpdateUserDTO data) {
        Utilizador user = repository.findById(id)
                .orElseThrow(() -> UserNotFoundException.forId(id));

        user.setNome(data.nome());
        user.setNumeroMecanografico(data.numeroMecanografico());
        user.setNumeroCC(data.numeroCC());
        user.setNumeroSNS(data.numeroSNS());
        user.setSexo(data.sexo());
        user.setRole(data.role());
        user.setContacto(data.contacto());
        user.setContactoEmergencia(data.contactoEmergencia());
        user.setDataNascimento(data.dataNascimento());
        user.setEmail(data.email());

        try {
            repository.save(user);
        } catch (Exception e) {
            throw new ConflictFieldsException();
        }
    }

    @Override
    public void activateUser(Long id) {
        Utilizador utilizador = repository.findById(id)
                .orElseThrow(() -> UserNotFoundException.forId(id));

        utilizador.setAtivo(true);
        repository.save(utilizador);
    }

    @Override
    public void deactivateUser(Long id) {
        Utilizador utilizador = repository.findById(id)
                .orElseThrow(() -> UserNotFoundException.forId(id));

        utilizador.setAtivo(false);
        repository.save(utilizador);
    }
}
