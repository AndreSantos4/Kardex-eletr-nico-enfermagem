package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.util.List;
import java.util.Optional;

import pt.ipcb.kardex.kardex_eletronico.dto.authentication.StrangeAttempDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.authentication.TentativaLoginDTO;

public interface LoginAttemptService {

    public void registar(Long numeroMecanografico, String ip, boolean sucesso, String motivoFalha);

    public List<StrangeAttempDTO> getStrangeActivity();

    public List<TentativaLoginDTO> getLoginAttemps(Optional<Boolean> success);
}
