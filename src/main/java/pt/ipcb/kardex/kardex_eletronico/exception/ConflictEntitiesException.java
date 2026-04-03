package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class ConflictEntitiesException extends KardexException {
    
    public ConflictEntitiesException(String message){
        super(message, HttpStatus.CONFLICT);
    }
}
