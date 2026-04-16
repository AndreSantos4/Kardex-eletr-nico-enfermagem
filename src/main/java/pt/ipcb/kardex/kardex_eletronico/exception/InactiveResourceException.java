package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class InactiveResourceException extends KardexException{

    public InactiveResourceException(String recurso) {
        super("O " + recurso + " se encontra inativo", HttpStatus.BAD_REQUEST);
    }
}
