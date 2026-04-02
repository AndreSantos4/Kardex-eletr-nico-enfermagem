package pt.ipcb.kardex.kardex_eletronico.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.repository.IpRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.SessaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.UtilizadorRepository;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final CookieService service;
    private final UtilizadorRepository repository;
    private final SessaoRepository sessaoRepository;
    private final IpRepository ipRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String ip = request.getRemoteAddr(); 
        if (ipRepository.existsByEnderecoIP(ip)) {
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write(
                    objectMapper.writeValueAsString(ApiResponse.error("Acesso Bloqueado")));
            return;
        }
        
        var token = service.recoverCookie(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        var subject = service.validateToken(token);
        if (subject == null) {
            filterChain.doFilter(request, response);
            return;
        }

        UserDetails user = repository.findByNumeroMecanografico(subject);
        Utilizador utilizadorEntity = (Utilizador) user;
        if (utilizadorEntity != null && sessaoRepository.findByUtilizador(utilizadorEntity).isPresent()) {
            if (utilizadorEntity.getAtivo()) {
                var authentication = new UsernamePasswordAuthenticationToken(
                    user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
