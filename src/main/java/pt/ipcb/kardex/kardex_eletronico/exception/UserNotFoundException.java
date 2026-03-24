package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends KardexException{
    public UserNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public static UserNotFoundException forId(Long id) {
        return new UserNotFoundException("Utilizador com id " + id + " não encontrado");
    }

    public static UserNotFoundException forNumeroMecanografico(Long numeroMecanografico) {
        return new UserNotFoundException("Utilizador com número mecanográfico " + numeroMecanografico + " não encontrado");
    }
}
