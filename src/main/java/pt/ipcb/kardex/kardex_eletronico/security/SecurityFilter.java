package pt.ipcb.kardex.kardex_eletronico.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final CookieService service;
    private final UtilizadorRepository repository;
    
    public SecurityFilter(CookieService service, UtilizadorRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var token = service.recoverCookie(request);
        if (token != null) {
            var subject = service.validateToken(token);
            UserDetails user = repository.findByNumeroMecanografico(subject);

            var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
