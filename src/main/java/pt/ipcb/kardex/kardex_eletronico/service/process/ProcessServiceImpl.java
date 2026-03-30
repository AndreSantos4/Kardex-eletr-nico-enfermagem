package pt.ipcb.kardex.kardex_eletronico.service.process;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.AdministracaoMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.PrescricaoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.AdministracaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.ProcessoClinicoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService{

    private final ProcessoClinicoRepository repository;
    private final MedicamentoRepository medicamentoRepository;
    private final PrescricaoMapper prescricaoMapper;
    private final PrescricaoRepository prescricaoRepository;
    private final AdministracaoRepository administracaoRepository;
    private final AdministracaoMapper administracaoMapper;

    private final WorkerService workerService;

    @Override
    @Transactional
    public void createPrescription(Long processId, CreatePrescriptionDTO data) {
        var process = repository.findById(processId)
            .orElseThrow(() -> EntityNotFoundException.forId(processId, "Processo"));
        var medication = medicamentoRepository.findById(data.idMedicamento())
            .orElseThrow(() -> EntityNotFoundException.forId(data.idMedicamento(), "Medicamento"));

        var prescription = prescricaoMapper.fromCreate(data, medication);

        prescription.setProcesso(process);
        
        prescricaoRepository.save(prescription);
    }

    @Override
    @Transactional
    public void administrateMedication(Long prescriptionId, CreateAdministrationDTO data, HttpServletRequest request) {
        var prescription = prescricaoRepository.findById(prescriptionId)
            .orElseThrow(() -> EntityNotFoundException.forId(prescriptionId, "Prescrição"));
        var worker = workerService.getAutenticatedWorker(request);
        var shift = workerService.getCurrentShift(worker.getId());

        var administration = administracaoMapper.fromCreate(data);
        administration.setPrescricao(prescription);
        administration.setFuncionario(worker);
        administration.setTurno(shift);

        administracaoRepository.save(administration);
    }
}
