package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends KardexException{
    public UserNotFoundException(Long numeroMecanografico) {
        super("Utilizador com número mecanográfico " + numeroMecanografico + " não encontrado", HttpStatus.NOT_FOUND);
    }
}
