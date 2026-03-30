package pt.ipcb.kardex.kardex_eletronico.service.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsServiceImpl implements SmsService {

    private static final String COUNTRY_CODE = "+351";
    
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromNumber;

    private void send(String to, String message) {
        Twilio.init(accountSid, authToken);
        Message.creator(
            new PhoneNumber(to),
            new PhoneNumber(fromNumber),
            message
        ).create();
    }

    public void sendTwoFactorMessage(int to, String codigo) {
        var message = String.format("O seu código de verificação Kardex é: %s", codigo);
        //send(COUNTRY_CODE + String.valueOf(to), message);
    }
}
