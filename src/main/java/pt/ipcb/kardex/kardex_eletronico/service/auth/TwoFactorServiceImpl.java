package pt.ipcb.kardex.kardex_eletronico.service.auth;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.exception.FailedTwoFactorException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;
import pt.ipcb.kardex.kardex_eletronico.service.external.SmsService;

@Service
@RequiredArgsConstructor
public class TwoFactorServiceImpl implements TwoFactorService {

    private final SmsService smsService;
    private final UtilizadorRepository repository;

    @Transactional
    public void enviarCodigo(Utilizador utilizador) {
        String codigo = String.format("%06d", new Random().nextInt(999999));
        utilizador.setCodigoVerificacao("123456");
        utilizador.setCodigoExpiraEm(LocalDateTime.now().plusMinutes(5));
        repository.save(utilizador);

        smsService.sendTwoFactorMessage(utilizador.getContacto(), codigo);
    }

    @Transactional
    public boolean verificarCodigo(Utilizador utilizador, String codigo) {
        if (utilizador.getCodigoExpiraEm().isBefore(LocalDateTime.now())) {
            throw new FailedTwoFactorException("Código expirado");
        }
        if (!utilizador.getCodigoVerificacao().equals(codigo)) {
            throw new FailedTwoFactorException("Código inválido");
        }

        utilizador.setCodigoVerificacao(null);
        utilizador.setCodigoExpiraEm(null);
        repository.save(utilizador);

        return true;
    }
}
