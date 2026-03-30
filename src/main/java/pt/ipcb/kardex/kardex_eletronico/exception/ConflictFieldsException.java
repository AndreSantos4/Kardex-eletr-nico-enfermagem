package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class ConflictFieldsException extends KardexException {
    public ConflictFieldsException() {
        super("Um ou mais campos estão em conflito com utilizadores existentes", HttpStatus.CONFLICT);
    }
}
