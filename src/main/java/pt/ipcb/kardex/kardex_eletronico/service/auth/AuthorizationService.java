package pt.ipcb.kardex.kardex_eletronico.service.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;

@Service
@RequiredArgsConstructor
public class AuthorizationService implements UserDetailsService {

    private final UtilizadorRepository repository;

    @Override
    public UserDetails loadUserByUsername(String numeroMecanograficoString) throws UsernameNotFoundException {
        var numeroMecanografico = Long.parseLong(numeroMecanograficoString);
        return repository.findByNumeroMecanografico(numeroMecanografico);
    }
}
