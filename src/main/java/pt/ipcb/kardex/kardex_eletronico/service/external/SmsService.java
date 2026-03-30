package pt.ipcb.kardex.kardex_eletronico.service.external;

public interface SmsService {

    public void sendTwoFactorMessage(int to, String codigo);
}
