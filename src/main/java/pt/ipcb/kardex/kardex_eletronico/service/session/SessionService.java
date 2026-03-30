package pt.ipcb.kardex.kardex_eletronico.service.session;

import java.util.List;
import java.util.Optional;

import pt.ipcb.kardex.kardex_eletronico.dto.authentication.StrangeAttempDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.TentativaLoginDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.ip.IpAdressBlockDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.session.SessaoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Sessao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface SessionService {

    void createOrUpdate(Utilizador utilizador, String ip);

    void delete(Utilizador utilizador);

    Optional<Sessao> findByUtilizador(Utilizador utilizador);

    List<SessaoDTO> getActiveSessions();

    void deleteSessionById(Long sessionId);

    void blockIp(IpAdressBlockDTO ip);

    void unblockIp(IpAdressBlockDTO ip);

    List<TentativaLoginDTO> getLoginAttemps(Optional<Boolean> success);

    public List<StrangeAttempDTO> getStrangeActivity();
}
