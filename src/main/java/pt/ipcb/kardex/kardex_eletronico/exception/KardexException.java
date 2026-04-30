package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

import lombok.Setter;

@Setter
public class KardexException extends RuntimeException{
    private final HttpStatus statusCode;
    
    public KardexException(String message){
        super(message);
        statusCode = HttpStatus.BAD_REQUEST;
    }

    public KardexException(String message, HttpStatus status) {
        super(message);
        statusCode = status;
    }

    public HttpStatus getStatus(){
        return statusCode;
    }
}
