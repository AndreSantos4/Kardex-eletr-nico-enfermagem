package pt.ipcb.kardex.kardex_eletronico.security;

import pt.ipcb.kardex.kardex_eletronico.dto.authentication.PasswordResetRequestDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PasswordResetRequest;

public interface PasswordTokenService {

    String hashPasswordResetUUID(String uuid);
    PasswordResetRequest generatePasswordRequest(PasswordResetRequestDTO data);
}