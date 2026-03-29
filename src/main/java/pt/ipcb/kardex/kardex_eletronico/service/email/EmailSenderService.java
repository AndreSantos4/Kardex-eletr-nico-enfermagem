package pt.ipcb.kardex.kardex_eletronico.service.email;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface EmailSenderService {

    void sendPasswordResetEmail(Utilizador utilizador, String token);

}
