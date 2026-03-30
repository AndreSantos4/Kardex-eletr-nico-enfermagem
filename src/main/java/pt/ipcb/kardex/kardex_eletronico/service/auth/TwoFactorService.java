package pt.ipcb.kardex.kardex_eletronico.service.auth;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface TwoFactorService {

    public void enviarCodigo(Utilizador utilizador);
    public boolean verificarCodigo(Utilizador utilizador, String codigo);
}
