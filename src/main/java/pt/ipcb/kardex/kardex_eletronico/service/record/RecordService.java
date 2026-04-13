package pt.ipcb.kardex.kardex_eletronico.service.record;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;

public interface RecordService {

    void recordPatientAcceptance(ProcessoClinicoDTO process, boolean newProcess, HttpServletRequest request);

    void recordPatientDischarge(ProcessoClinicoDTO proces, HttpServletRequest request);

    long getAcceptedPatientsCountToday();

    long getDischargedPatientsCountToday();
}
