package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.repository.TentativaLoginRepository;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.StrangeAttempDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.TentativaLoginDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.TentativaLogin;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TentativaLoginMapper;

@Service
@RequiredArgsConstructor
public class LoginAttemptServiceImpl implements LoginAttemptService{

    private final TentativaLoginRepository repository;
    private final TentativaLoginMapper mapper;

    @Transactional
    public void registar(Long numeroMecanografico, String ip, boolean sucesso, String motivoFalha) {
        repository.save(new TentativaLogin(
            null,
            numeroMecanografico,
            ip,
            sucesso,
            LocalDateTime.now(),
            sucesso ? null : motivoFalha
        ));
    }

    @Transactional(readOnly = true)
    public List<StrangeAttempDTO> getStrangeActivity() {
        LocalDateTime since = LocalDateTime.now().minusMinutes(10);
        return repository.findStrangeActivity(since)
            .stream()
            .map(row -> new StrangeAttempDTO(
                (String) row[0],
                (Long) row[1],
                (Long) row[2]
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TentativaLoginDTO> getLoginAttemps(Optional<Boolean> success){
        if(success.isPresent()){
            return repository.findBySucesso(success.get())
                .stream()
                .map(mapper::toDTO)
                .toList();
        }
        
        return repository.findAll()
            .stream()
            .map(mapper::toDTO)
            .toList();
    }
}
