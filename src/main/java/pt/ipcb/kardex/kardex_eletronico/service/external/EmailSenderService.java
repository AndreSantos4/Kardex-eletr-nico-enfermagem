package pt.ipcb.kardex.kardex_eletronico.service.external;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface EmailSenderService {

    void sendPasswordResetEmail(Utilizador utilizador, String token);

}
