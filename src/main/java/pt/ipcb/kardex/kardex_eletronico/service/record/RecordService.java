package pt.ipcb.kardex.kardex_eletronico.service.record;

import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface RecordService {

    void recordPatientAcceptance(ProcessoClinicoDTO process, boolean newProcess);

    void recordPatientDischarge(ProcessoClinicoDTO proces);

    void recordUserRegistration(Utilizador newUser, boolean isWorker);

    void recordUserLogout(Utilizador user);

    void recordUserLogin(Utilizador user);

    long getAcceptedPatientsCountToday();

    long getDischargedPatientsCountToday();

    void recordLoginAttempt(Long numeroMecanografico, String ip, boolean sucesso);

    void recordPasswordResetRequest(Utilizador user);
}
