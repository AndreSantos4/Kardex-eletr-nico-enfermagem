package pt.ipcb.kardex.kardex_eletronico.service.record;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.record.RegistoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.RegistoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegistoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.RegistoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.RegistoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClinicRecordServiceImpl implements ClinicRecordService{

    private final RegistoClinicoRepository repository;
    private final RegistoMapper mapper;

    private final WorkerService workerService;

    @Transactional
    @Override
    public void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo) {
        createClinicRecord(processo, tipo, null, 0);
    }

    @Transactional
    @Override
    public void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo, String detalhes) {
        createClinicRecord(processo, tipo, detalhes, 0);
    }

    @Transactional
    @Override
    public void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo, float detalhesNumericos) {
        createClinicRecord(processo, tipo, null, detalhesNumericos);
    }

    @Transactional
    @Override
    public void createClinicRecord(ProcessoClinico processo, TipoRegistoClinico tipo, String detalhes, float detalhesNumericos) {
        var worker = workerService.getAutenticatedWorker();

        var record = new RegistoClinico();
        record.setDetalhes(detalhes);
        record.setTipo(tipo);
        record.setProcesso(processo);
        record.setDetalhesNumericos(detalhesNumericos);
        record.setFuncionario(worker);

        repository.save(record);
    }

    @Transactional(readOnly = true)
    @Override
    public List<RegistoClinicoDTO> getAllRecords() {
        var records = repository.findAll();
        return mapper.toCLinicDTOList(records);
    }
}
