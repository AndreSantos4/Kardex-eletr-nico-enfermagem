package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class UserAlreadyExistsException extends KardexException{

    public UserAlreadyExistsException(Long numeroMecanografico) {
        super("Utilizador com número mecanográfico " + numeroMecanografico + " já existe", HttpStatus.CONFLICT);
    }
}
