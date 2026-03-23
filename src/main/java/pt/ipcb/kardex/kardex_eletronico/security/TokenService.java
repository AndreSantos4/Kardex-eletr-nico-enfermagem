package pt.ipcb.kardex.kardex_eletronico.security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

@Service
public class TokenService {
    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(Utilizador user){
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String token = JWT.create()
                .withIssuer("kardex-eletronico-enfermagem")
                .withSubject(user.getNumeroMecanografico().toString())
                .withExpiresAt(getExpirationDate())
                .sign(algorithm);

            return token;
        } catch(JWTCreationException ex){
            throw new RuntimeException("Error while generatinb token");
        }
    }

    public Long validateToken(String token){
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String tokenSubject = JWT.require(algorithm)
                .withIssuer("kardex-eletronico-enfermagem")
                .build()
                .verify(token)
                .getSubject();

            return Long.parseLong(tokenSubject);
        } catch (JWTVerificationException ex) {
            return 0l;
        }
    }

    private Instant getExpirationDate(){
        return LocalDateTime.now().plusHours(8).toInstant(ZoneOffset.of("+00:00"));
    }
}
