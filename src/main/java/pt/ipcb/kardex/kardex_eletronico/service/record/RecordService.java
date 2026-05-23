package pt.ipcb.kardex.kardex_eletronico.service.record;

import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.RecordFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.util.PaginationDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

import java.util.List;

public interface RecordService {

    @Transactional(readOnly = true)
    List<RegistoDTO> getRecords(PaginationDTO pagination, RecordFilter filter);

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
