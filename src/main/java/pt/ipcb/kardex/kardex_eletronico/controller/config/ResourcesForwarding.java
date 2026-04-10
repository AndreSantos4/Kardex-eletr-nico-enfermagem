package pt.ipcb.kardex.kardex_eletronico.controller.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("")
public class ResourcesForwarding {

    @GetMapping("/login")
    public ModelAndView login() {
        return new ModelAndView("forward:/pages/login/login.html");
    }

    @GetMapping("/recuperarPassword")
    public ModelAndView recuperarPassword(@RequestParam("t") String token) {
        return new ModelAndView("forward:/pages/login/recuperarPassword.html?t=" + token);
    }

    @GetMapping("/adminDashboard")
    public ModelAndView adminDashboard() {
        return new ModelAndView("forward:/pages/admin/adminDashboard.html");
    }

    @GetMapping("/adminGestaoUtilizadores")
    public ModelAndView adminGestaoUtilizadores() {
        return new ModelAndView("forward:/pages/admin/adminGestaoUtilizadores.html");
    }

    @GetMapping("/adminSessoesAtivas")
    public ModelAndView adminSessoesAtivas() {
        return new ModelAndView("forward:/pages/admin/adminSessoesAtivas.html");
    }

    @GetMapping("/perfilColaborador")
    public ModelAndView perfilColaborador() {
        return new ModelAndView("forward:/pages/admin/perfilColaborador.html");
    }

    /* ENFERMEIRO */

    @GetMapping("/enfermeiroKardexUtente")
    public ModelAndView enfermeiroKardexUtente(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroKardexUtente.html?id=" + id);
    }

    @GetMapping("/enfermeiroDashboard")
    public ModelAndView enfermeiroDashboard() {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroDashboard.html");
    }

    @GetMapping("/enfermeiroListaUtentes")
    public ModelAndView enfermeiroListaUtentes() {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroListaUtentes.html");
    }

    /* MÉDICO */

    @GetMapping("/medicoDashboard")
    public ModelAndView medicoDashboard() {
        return new ModelAndView("forward:/pages/medico/medicoDashboard.html");
    }

    @GetMapping("/medicoListaUtentes")
    public ModelAndView medicoListaUtentes() {
        return new ModelAndView("forward:/pages/medico/medicoListaUtentes.html");
    }

    @GetMapping("/medicoKardexUtente")
    public ModelAndView medicoKardexUtente() {
        return new ModelAndView("forward:/pages/medico/medicoKardexUtente.html");
    }
}
