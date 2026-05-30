package pt.ipcb.kardex.kardex_eletronico.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pt.ipcb.kardex.kardex_eletronico.controller.config.ApiResponse;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfiguration {

    private final ObjectMapper objectMapper;
    private final SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity)
            throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        /* ---------- public endpoints ---------- */
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/password-reset").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/change-password").permitAll()
                        .requestMatchers("/styles/**", "/scripts/**").permitAll()
                        .requestMatchers(
                                "/login",
                                "/pages/login/**",
                                "/recuperarPassword")
                        .permitAll()

                        /* ---------- API rules by role ---------- */
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAnyRole("ADMIN", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.PUT, "/api/users/{userId}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.PATCH,
                                "/api/users/{id}/activate",
                                "/api/users/{id}/deactivate").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/auth/password-reset").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/workers/medics").hasAnyRole("ENFERMEIRO", "MEDICO")
                        .requestMatchers(HttpMethod.GET,
                                "/api/workers/{workerId}",
                                "/api/workers/{workerId}/summary",
                                "/api/workers/{workerId}/shifts/summary",
                                "/api/workers/{workerId}/shifts").hasAnyRole("ADMIN", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.POST, "/api/patients").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/patientId").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.GET,
                                "/api/patients",
                                "/api/patients/patiendId").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE", "MEDICO")
                        .requestMatchers(HttpMethod.PATCH, "/api/processes/processId/discharge").hasAnyRole("MEDICO")
                        .requestMatchers(HttpMethod.POST, "/api/processes/processId/vitals").hasAnyRole("ENFERMEIRO", "ENFERMEIRO_CHEFE")
                        .requestMatchers(HttpMethod.GET, "/api/sessions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/processes/processId/prescriptions").hasAnyRole("MEDICO", "ENFERMEIRO_CHEFE", "ENFERMEIRO")
                        .requestMatchers(HttpMethod.POST, "/api/processes/prescription/prescriptionId/administrations").hasAnyRole("ENFERMEIRO_CHEFE", "ENFERMEIRO")
                        .requestMatchers(HttpMethod.POST, "/api/processes/processId/prescriptions").hasAnyRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/stock/medications").hasAnyRole("ADMIN", "MEDICO", "ENFERMEIRO")
                        .requestMatchers("/api/stock/medications").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/{sessionId}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/ip").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/sessions/ip").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/stats/**").authenticated()

                        /* ---------- page rules by role (covers BOTH clean URLs AND direct .html access) ----------
                         * Order matters: more specific role prefixes must come BEFORE less specific ones
                         * (so /enfermeiroChefe* is matched before /enfermeiro*).
                         */
                        .requestMatchers(
                                "/enfermeiroChefe*",
                                "/pages/enfermeiroChefe/**")
                        .hasRole("ENFERMEIRO_CHEFE")
                        .requestMatchers(
                                "/enfermeiro*",
                                "/pages/enfermeiro/**")
                        .hasRole("ENFERMEIRO")
                        .requestMatchers(
                                "/medico*",
                                "/pages/medico/**")
                        .hasRole("MEDICO")
                        .requestMatchers(
                                "/admin*",
                                "/perfilColaborador",
                                "/pages/admin/**")
                        .hasRole("ADMIN")

                        /* shared popup fragments fetched by the page JS */
                        .requestMatchers("/pages/popups/**").authenticated()

                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) -> {
                            if (isHtmlRequest(request)) {
                                response.sendRedirect("/login");
                                return;
                            }
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write(
                                    objectMapper.writeValueAsString(ApiResponse.error("Unauthorized")));
                        })
                        .accessDeniedHandler((request, response, e) -> {
                            if (isHtmlRequest(request)) {
                                response.sendRedirect("/login");
                                return;
                            }
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write(
                                    objectMapper.writeValueAsString(ApiResponse.error("Forbidden")));
                        }))
                .addFilterBefore(
                        securityFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Treat the request as a browser navigation when:
     *  - it is NOT an /api/** call, AND
     *  - the Accept header advertises text/html (typical browser address-bar request)
     * This lets fetch/XHR calls keep receiving JSON while page navigations get redirected.
     */
    private static boolean isHtmlRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path != null && path.startsWith("/api/")) {
            return false;
        }
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains("text/html");
    }
}
