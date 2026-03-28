package pt.ipcb.kardex.kardex_eletronico.service.session;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Sessao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.SessaoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService{

    private final SessaoRepository repository;
    private final SessaoMapper mapper;

    public void createOrUpdate(Utilizador utilizador, String ip) {
        Sessao sessao = repository.findByUtilizador(utilizador)
            .orElse(new Sessao());

        sessao.setUtilizador(utilizador);
        sessao.setEnderecoIP(ip);
        sessao.setInicio(LocalDateTime.now());
        repository.save(sessao);
    }

    public void delete(Utilizador utilizador) {
        repository.deleteByUtilizador(utilizador);
    }

    public Optional<Sessao> findByUtilizador(Utilizador utilizador) {
        return repository.findByUtilizador(utilizador);
    }

    @Override
    public List<SessaoDTO> getActiveSessions() {
        var cutoff = LocalDateTime.now().minusHours(8);
        return mapper.toDTOList(repository.findAllByInicioAfter(cutoff));
    }
}