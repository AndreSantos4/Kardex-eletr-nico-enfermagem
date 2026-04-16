package pt.ipcb.kardex.kardex_eletronico.service.user;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.OrderBy;
import pt.ipcb.kardex.kardex_eletronico.dto.user.ChangeUserPasswordDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UpdateUserDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.user.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.ExpiredResourceException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.UtilizadorMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.PasswordResetRequestRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.security.PasswordTokenService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final int PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

    private final UtilizadorRepository repository;
    private final UtilizadorMapper mapper;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final PasswordTokenService passwordTokenService;

    @Override
    @Transactional(readOnly = true)
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
            case ASC -> users = users.stream().sorted((u1, u2) -> u2.getNome().compareTo(u1.getNome())).toList();
            case DESC -> users = users.stream().sorted((u1, u2) -> u1.getNome().compareTo(u2.getNome())).toList();
        }

        return users
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UtilizadorDTO getUserById(Long id) {
        Utilizador user = repository.findById(id)
                .orElseThrow(() -> EntityNotFoundException.forId(id, "Utilizador"));

        return mapper.toDTO(user);
    }

    @Override
    @Transactional
    public UtilizadorDTO getUserDTOByToken() {
        var user = (Utilizador) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return mapper.toDTO(user);
    }

    @Override
    @Transactional
    public void updateUser(Long id, UpdateUserDTO data) {
        Utilizador user = repository.findById(id)
                .orElseThrow(() -> EntityNotFoundException.forId(id, "Utilizador"));

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
            throw new ConflictEntitiesException("Conflito com utilizadores existentes em um dos campos preenchidos");
        }
    }

    @Override
    @Transactional
    public void activateUser(Long id) {
        Utilizador utilizador = repository.findById(id)
                .orElseThrow(() -> EntityNotFoundException.forId(id, "Utilizador"));

        utilizador.setAtivo(true);
        repository.save(utilizador);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        Utilizador utilizador = repository.findById(id)
                .orElseThrow(() -> EntityNotFoundException.forId(id, "Utilizador"));

        utilizador.setAtivo(false);
        repository.save(utilizador);
    }

    @Override
    @Transactional(readOnly = true)
    public long getActiveUsersCount() {
        return repository.countByAtivoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public long validatePasswordResetRequest(String token) {
        var tokenHash = passwordTokenService.hashPasswordResetUUID(token);

        var resetRequest = passwordResetRequestRepository.findByTokenHash(tokenHash);

        if (!resetRequest.isValid(PASSWORD_RESET_TOKEN_EXPIRY_MINUTES)) {
            throw new ExpiredResourceException("Token de Reset de Password");
        }

        return resetRequest.getNumeroMecanografico();
    }

    @Override
    @Transactional
    public void changePassword(Long numeroMecanografico, ChangeUserPasswordDTO newPassword) {
        if (!passwordResetRequestRepository.existsById(numeroMecanografico))
            throw new EntityNotFoundException("Password reset request");
        var user = (Utilizador) repository.findByNumeroMecanografico(numeroMecanografico);

        var newPasswordHash = new BCryptPasswordEncoder().encode(newPassword.newPassword());
        user.setPasswordHash(newPasswordHash);

        repository.save(user);
    }
}
