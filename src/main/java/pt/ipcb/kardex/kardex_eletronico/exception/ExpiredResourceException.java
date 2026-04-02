package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class ExpiredResourceException extends KardexException{

    public ExpiredResourceException(String recurso) {
        super("O " + recurso + " ja expirou", HttpStatus.BAD_REQUEST);
    }
}
