package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

import lombok.Setter;

@Setter
public abstract class KardexException extends RuntimeException{
    private final HttpStatus statusCode;

    public KardexException(String message, HttpStatus status) {
        super(message);
        statusCode = status;
    }

    public HttpStatus getStatus(){
        return statusCode;
    }
}
