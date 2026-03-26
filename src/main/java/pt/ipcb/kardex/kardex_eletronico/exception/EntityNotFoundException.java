package pt.ipcb.kardex.kardex_eletronico.exception;

import org.springframework.http.HttpStatus;

public class EntityNotFoundException extends KardexException{
    public EntityNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public static EntityNotFoundException forId(Long id, String entity) {
        return new EntityNotFoundException(entity + " com id " + id + " não encontrado");
    }
}
