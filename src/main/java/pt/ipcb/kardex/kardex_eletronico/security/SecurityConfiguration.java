package pt.ipcb.kardex.kardex_eletronico.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfiguration {
    private final ObjectMapper objectMapper;
    private final SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAnyRole("ADMIN", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.PUT, "/api/users/{userId}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/{id}/activate", "/api/users/{id}/deactivate")
                            .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/auth/password-reset").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/password-reset").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/change-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/workers/medics").hasAnyRole("ENFERMEIRO", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/workers/{workerId}", 
                                                                    "/api/workers/{workerId}/summary", 
                                                                    "/api/workers/{workerId}/shifts/summary", 
                                                                    "/api/workers/{workerId}/shifts")
                            .hasAnyRole("ADMIN", "ENFERMEIRO_CHEFE")

                        .requestMatchers(HttpMethod.POST, "api/patients").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.PUT, "api/patients/patientId").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.GET, "api/patients", "api/patients/patiendId")
                            .hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE", "MEDICO")

                        .requestMatchers(HttpMethod.PATCH, "api/processes/processId/discharge").hasAnyRole("MEDICO")
                        .requestMatchers(HttpMethod.POST, "api/processes/processId/vitals").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE")

                        .requestMatchers(HttpMethod.GET, "/api/sessions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/{sessionId}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/ip").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/sessions/ip").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/stats/**").authenticated()

                        .requestMatchers("/styles/**", "/scripts/**").permitAll()
                        .requestMatchers("/login", "/pages/login/login.html", "/recuperarPassword", "/pages/login/recuperarPassword.html").permitAll()
                        .requestMatchers("/adminDashboard", "/adminGestaoUtilizadores", "/adminSessoesAtivas", "/perfilColaborador")
                            .hasRole("ADMIN")
                        .requestMatchers("/medicoDashboard", "/medicoKardexUtente", "/medicoListaUtentes").hasRole("MEDICO")
                        .requestMatchers("/enfermeiroDashboard", "/enfermeiroKardexUntente", "enfermeiroListaUtentes").hasRole("ENFERMEIRO")
                        .requestMatchers("/enfermeiroChefeDashboard").hasRole("ENFERMEIRO_CHEFE")
                        
                        .anyRequest().authenticated())


                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter()
                                    .write(objectMapper.writeValueAsString(ApiResponse.error("Unauthorized")));
                        })
                        .accessDeniedHandler((request, response, e) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error("Forbidden")));
                        }))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
