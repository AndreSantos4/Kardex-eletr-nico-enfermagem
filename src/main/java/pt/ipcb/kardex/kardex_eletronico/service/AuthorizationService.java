package pt.ipcb.kardex.kardex_eletronico.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;

@Service
public class AuthorizationService implements UserDetailsService {

    @Autowired
    UtilizadorRepository repository;

    @Override
    public UserDetails loadUserByUsername(String numeroMecanograficoString) throws UsernameNotFoundException {
        var numeroMecanografico = Long.parseLong(numeroMecanograficoString);
        return repository.findByNumeroMecanografico(numeroMecanografico);
    }
}
