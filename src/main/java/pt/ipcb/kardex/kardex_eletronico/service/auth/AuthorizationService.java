package pt.ipcb.kardex.kardex_eletronico.service.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;

@Service
@RequiredArgsConstructor
public class AuthorizationService implements UserDetailsService {

    private final UtilizadorRepository repository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        UserDetails user = repository.findByNumeroMecanografico(Long.parseLong(username));
        
        if (user == null) {
            throw new UsernameNotFoundException("Utilizador não encontrado: " + username);
        }
        
        return user;
    }
}
