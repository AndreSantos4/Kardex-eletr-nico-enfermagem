package pt.ipcb.kardex.kardex_eletronico.security;

import java.time.LocalDateTime;
import java.util.UUID;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import pt.ipcb.kardex.kardex_eletronico.dto.authentication.PasswordResetRequestDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PasswordResetRequest;

@Service
public class PasswordTokenServiceImpl implements PasswordTokenService{

    @Override
    public String hashPasswordResetUUID(String uuid) {
        try {
            String token = DigestUtils.sha256Hex(uuid);
            return token;
        } catch (Exception e) {
            throw new RuntimeException("Algo correu mal encriptando o token uuid");
        }
    }

    @Override
    public PasswordResetRequest generatePasswordRequest(PasswordResetRequestDTO data) {
        var token = UUID.randomUUID().toString();
        var tokenHash = hashPasswordResetUUID(token);
        
        return new PasswordResetRequest(Long.parseLong(data.numeroMecanografico()), tokenHash, token, LocalDateTime.now());
    }
}
