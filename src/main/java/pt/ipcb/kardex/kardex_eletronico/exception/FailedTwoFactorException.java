package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class FailedTwoFactorException extends KardexException {

    public FailedTwoFactorException(String porpose) {
        super("Autenticação por dois fatores falhada, causa: " + porpose, HttpStatus.UNAUTHORIZED);
    }

}
