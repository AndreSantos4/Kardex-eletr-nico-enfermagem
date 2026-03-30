package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class FailedEmailMessageException extends KardexException {
    public FailedEmailMessageException(String to, String porpose) {
        super("Falha em enviar mensagem de email para " + to + " para o propósito: " + porpose, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
