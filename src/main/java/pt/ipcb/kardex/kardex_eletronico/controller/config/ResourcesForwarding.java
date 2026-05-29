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

    /* ADMIN */

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

    @GetMapping("/adminMedicamentos")
    public ModelAndView adminMedicamentos() {
        return new ModelAndView("forward:/pages/admin/adminMedicamentos.html");
    }

    @GetMapping("/adminRelatoriosIndicadores")
    public ModelAndView adminRelatoriosIndicadores() {
        return new ModelAndView("forward:/pages/admin/adminRelatoriosIndicadores.html");
    }

    @GetMapping("/adminConsultarLogsAuditoria")
    public ModelAndView adminConsultarLogsAuditoria() {
        return new ModelAndView("forward:/pages/admin/adminConsultarLogsAuditoria.html");
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

    @GetMapping("/enfermeiroHistoricoPrescricoes")
    public ModelAndView enfermeiroHistoricoPrescricoes(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroHistoricoPrescricoes.html?id=" + id);
    }

    @GetMapping("/enfermeiroPassagemTurno")
    public ModelAndView enfermeiroPassagemTurno() {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroPassagemTurno.html");
    }

    @GetMapping("/enfermeiroPlanoCuidados")
    public ModelAndView enfermeiroPlanoCuidados(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroPlanoCuidados.html?id=" + id);
    }

    @GetMapping("/enfermeiroAdministracaoMedicacao")
    public ModelAndView enfermeiroAdministracaoMedicacao(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiro/enfermeiroAdministracaoMedicacao.html?id=" + id);
    }

    /* ENFERMEIRO CHEFE */

    @GetMapping("/enfermeiroChefeDashboard")
    public ModelAndView enfermeiroChefeDashboard() {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeDashboard.html");
    }

    @GetMapping("/enfermeiroChefeListaUtentes")
    public ModelAndView enfermeiroChefeListaUtentes() {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeListaUtentes.html");
    }

    @GetMapping("/enfermeiroChefeGerirTurnos")
    public ModelAndView enfermeiroChefeGerirTurnos() {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeGerirTurnos.html");
    }

    @GetMapping("/enfermeiroChefeControloStock")
    public ModelAndView enfermeiroChefeControloStock(){
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeControloStock.html");
    }

    @GetMapping("/enfermeiroChefeRelatoriosIndicadores")
    public ModelAndView enfermeiroChefeRelatoriosIndicadores() {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeRelatoriosIndicadores.html");
    }

    @GetMapping("/enfermeiroChefeValidarPassagemTurno")
    public ModelAndView enfermeiroChefeValidarPassagemTurno() {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeValidarPassagemTurno.html");
    }

    @GetMapping("/enfermeiroChefeHistoricoTurnos")
    public ModelAndView enfermeiroChefeHistoricoTurnos() {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeHistoricoTurnos.html");
    }

    @GetMapping("/enfermeiroChefeKardexUtente")
    public ModelAndView enfermeiroChefeKardexUtente(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeKardexUtente.html?id=" + id);
    }

    @GetMapping("/enfermeiroChefePlanoCuidados")
    public ModelAndView enfermeiroChefePlanoCuidados(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefePlanoCuidados.html?id=" + id);
    }

    @GetMapping("/enfermeiroChefeHistoricoPrescricoes")
    public ModelAndView enfermeiroChefeHistoricoPrescricoes(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/enfermeiroChefe/enfermeiroChefeHistoricoPrescricoes.html?id=" + id);
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
    public ModelAndView medicoKardexUtente(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/medico/medicoKardexUtente.html?id=" + id);
    }

    @GetMapping("/medicoPrescreverMedicamento")
    public ModelAndView medicoPrescreverMedicamento(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/medico/medicoPrescreverMedicamento.html?id=" + id);
    }

    @GetMapping("/medicoHistoricoPrescricoes")
    public ModelAndView medicoHistoricoPrescricoes(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/medico/medicoHistoricoPrescricoes.html?id=" + id);
    }

    @GetMapping("/medicoNotasClinicas")
    public ModelAndView medicoNotasClinicas(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/medico/medicoNotasClinicas.html?id=" + id);
    }

    @GetMapping("/medicoExames")
    public ModelAndView medicoExames(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/medico/medicoExames.html?id=" + id);
    }

    @GetMapping("/medicoPlanoCuidados")
    public ModelAndView medicoPlanoCuidados(@RequestParam("id") Long id) {
        return new ModelAndView("forward:/pages/medico/medicoPlanoCuidados.html?id=" + id);
    }
}
