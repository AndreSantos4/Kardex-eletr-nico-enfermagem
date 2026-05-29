package pt.ipcb.kardex.kardex_eletronico.service.record;

import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegistoClinico;

import java.util.List;

public interface ClinicRecordService {

    void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo);

    void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo, String detalhes);

    void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo, float detalhesNumericos);

    void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo, String detalhes, float detalhesNumericos);

    List<RegistoClinicoDTO> getAllRecords();

    List<RegistoClinicoDTO> getAllRecords(Long processId);
}
