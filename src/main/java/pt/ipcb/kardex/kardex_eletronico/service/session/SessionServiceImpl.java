package pt.ipcb.kardex.kardex_eletronico.service.session;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.StrangeAttempDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.TentativaLoginDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.ip.IpAdressBlockDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Sessao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.IpBloqueadoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.SessaoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.IpRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.auth.LoginAttemptService;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService{

    private final SessaoRepository repository;
    private final SessaoMapper mapper;
    private final IpRepository ipRepository;
    private final IpBloqueadoMapper ipMapper;
    private final LoginAttemptService loginAttemptService;

    @Transactional
    public void createOrUpdate(Utilizador utilizador, String ip) {
        Sessao sessao = repository.findByUtilizador(utilizador)
            .orElse(new Sessao());

        sessao.setUtilizador(utilizador);
        sessao.setEnderecoIP(ip);
        sessao.setInicio(LocalDateTime.now());
        repository.save(sessao);
    }

    @Transactional
    public void delete(Utilizador utilizador) {
        repository.deleteByUtilizador(utilizador);
    }

    @Transactional
    public void deleteSessionById(Long sessionId) {
        repository.deleteById(sessionId);
    }

    @Transactional(readOnly = true)
    public Optional<Sessao> findByUtilizador(Utilizador utilizador) {
        return repository.findByUtilizador(utilizador);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessaoDTO> getActiveSessions() {
        var cutoff = LocalDateTime.now().minusHours(8);
        return mapper.toDTOList(repository.findAllByInicioAfter(cutoff));
    }

    @Override
    @Transactional
    public void blockIp(IpAdressBlockDTO ip) {
        ipRepository.save(ipMapper.fromCreate(ip));
    }

    @Override
    @Transactional
    public void unblockIp(IpAdressBlockDTO ip) {
        ipRepository.deleteByEnderecoIP(ip.enderecoIP());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TentativaLoginDTO> getLoginAttemps(Optional<Boolean> success) {
        return loginAttemptService.getLoginAttemps(success);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StrangeAttempDTO> getStrangeActivity() {
        return loginAttemptService.getStrangeActivity();
    }
}