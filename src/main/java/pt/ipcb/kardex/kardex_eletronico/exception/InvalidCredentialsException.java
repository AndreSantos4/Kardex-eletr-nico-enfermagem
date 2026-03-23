package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends KardexException{

    public InvalidCredentialsException() {
        super("Credenciais inválidas", HttpStatus.UNAUTHORIZED);
    }
}
