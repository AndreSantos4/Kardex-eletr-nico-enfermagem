package pt.ipcb.kardex.kardex_eletronico.controller.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("")
public class ResourcesForwarding {


    @GetMapping("/login")
    public ModelAndView login(){
        return new ModelAndView("forward:/pages/login/login.html");
    }

    @GetMapping("/recuperarPassword")
    public ModelAndView recuperarPassword(){
        return new ModelAndView("forward:/pages/login/recuperarPassword.html");
    }

    @GetMapping("/adminDashboard")
    public ModelAndView adminDashboard(){
        return new ModelAndView("forward:/pages/admin/adminDashboard.html");
    }

    @GetMapping("/adminGestaoUtilizadores")
    public ModelAndView adminGestaoUtilizadores(){
        return new ModelAndView("forward:/pages/admin/adminGestaoUtilizadores.html");
    }

    @GetMapping("/adminSessoesAtivas")
    public ModelAndView adminSessoesAtivas(){
        return new ModelAndView("forward:/pages/admin/adminSessoesAtivas.html");
    }

    @GetMapping("/perfilColaborador")
    public ModelAndView perfilColaborador(){
        return new ModelAndView("forward:/pages/admin/perfilColaborador.html");
    }

    @GetMapping("/medicoDashboard")
    public ModelAndView medicoDashboard(){
        return new ModelAndView("forward:/pages/medico/medicoDashboard.html");
    }
}
