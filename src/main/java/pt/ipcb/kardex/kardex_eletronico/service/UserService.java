package pt.ipcb.kardex.kardex_eletronico.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.UtilizadorDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictFieldsException;
import pt.ipcb.kardex.kardex_eletronico.exception.UserNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.mappers.UtilizadorMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    
    private final UtilizadorRepository repository;
    private final UtilizadorMapper mapper;

    @Override
    public UtilizadorDTO getUserById(Long id) {
        Utilizador user = repository.findById(id)
            .orElseThrow(() -> UserNotFoundException.forId(id));

        return mapper.toDTO(user);
    }

    @Override
    public void updateUser(Long id, UtilizadorDTO data) {
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
    public void deactivateUser(Long id) {
        Utilizador utilizador = repository.findById(id)
            .orElseThrow(() -> UserNotFoundException.forId(id));

        utilizador.setAtivo(false);
        repository.save(utilizador);
    }
}
