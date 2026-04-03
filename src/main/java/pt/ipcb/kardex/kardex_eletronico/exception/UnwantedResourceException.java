package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class UnwantedResourceException extends KardexException{

    public UnwantedResourceException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
