package pt.ipcb.kardex.kardex_eletronico.service.session;

import java.util.List;
import java.util.Optional;

import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Sessao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface SessionService {

    void createOrUpdate(Utilizador utilizador, String ip);

    void delete(Utilizador utilizador);

    Optional<Sessao> findByUtilizador(Utilizador utilizador);

    List<SessaoDTO> getActiveSessions();
}
