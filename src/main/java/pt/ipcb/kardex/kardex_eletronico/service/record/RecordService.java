package pt.ipcb.kardex.kardex_eletronico.service.record;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface RecordService {

    void recordPatientAcceptance(ProcessoClinicoDTO process, boolean newProcess, HttpServletRequest request);

    void recordPatientDischarge(ProcessoClinicoDTO proces, HttpServletRequest request);

    void recordUserRegistration(Utilizador newUser, boolean isWorker);

    void recordUserLogout(Utilizador user);

    void recordUserLogin(Utilizador user);

    long getAcceptedPatientsCountToday();

    long getDischargedPatientsCountToday();

    void recordLoginAttempt(Long numeroMecanografico, String ip, boolean sucesso);

    void recordPasswordResetRequest(Utilizador user);
}
