package pt.ipcb.kardex.kardex_eletronico.service.process;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PrescricaoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService{

    private final ProcessoClinicoRepository repository;
    private final MedicamentoRepository medicamentoRepository;
    private final PrescricaoMapper prescricaoMapper;
    private final PrescricaoRepository prescricaoRepository;

    @Override
    public void createPrescription(Long processId, CreatePrescriptionDTO data) {
        var process = repository.findById(processId)
            .orElseThrow(() -> EntityNotFoundException.forId(data.idMedicamento(), "Processo"));
        var medication = medicamentoRepository.findById(data.idMedicamento())
            .orElseThrow(() -> EntityNotFoundException.forId(data.idMedicamento(), "Medicamento"));

        var prescription = prescricaoMapper.fromCreate(data, medication);

        prescription.setProcesso(process);
        
        prescricaoRepository.save(prescription);
    }
}
