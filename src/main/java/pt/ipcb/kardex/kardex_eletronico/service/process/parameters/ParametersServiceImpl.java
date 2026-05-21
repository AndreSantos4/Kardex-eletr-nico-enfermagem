package pt.ipcb.kardex.kardex_eletronico.service.process.parameters;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.*;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.ParametrosMapper;
import pt.ipcb.kardex.kardex_eletronico.service.process.ProcessService;
import pt.ipcb.kardex.kardex_eletronico.service.stock.StockService;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParametersServiceImpl implements ParametersService {

    private final ProcessService processService;
    private final WorkerService workerService;
    private final StockService stockService;

    private final ParametrosMapper mapper;

    @Override
    @Transactional
    public void registerCateter(Long processId, CreateCateterDTO data) {
        var process = processService.getValidProcess(processId);
        var worker = workerService.getAutenticatedWorker();

        var cateter = mapper.fromCreateCateterDto(data);
        cateter.setFuncionario(worker);
        cateter.setProcessoClinico(process);

        process.cateteres.add(cateter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CateterDTO> getAllCateteres(Long processId) {
        var process = processService.getValidProcess(processId);

        var cateteres = process.getCateteres();
        return mapper.toCateterDtoList(cateteres);
    }

    @Override
    @Transactional
    public void registerIncident(Long processId, CreateIncidenteDTO data) {
        var process = processService.getValidProcess(processId);
        var worker = workerService.getAutenticatedWorker();
        var shift = workerService.getCurrentShift(worker.getId());

        var incident = mapper.fromCreateIncidentDto(data);
        incident.setProcessoClinico(process);
        incident.setFuncionario(worker);
        incident.setTurno(shift);

        process.getIncidentes().add(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenteDTO> getAllIncidents(Long processId) {
        var process = processService.getValidProcess(processId);

        var incidents = process.getIncidentes();
        return mapper.toIncidentDtoList(incidents);
    }

    @Override
    @Transactional
    public void registerContainment(Long processId, CreateContencaoDTO data) {
        var process = processService.getValidProcess(processId);
        var worker = workerService.getAutenticatedWorker();
        var medication = stockService.getMedication(data.idMedicamento());
        var dose = medication.getDosagens().stream().filter(d -> d.id == data.idDose()).findFirst()
                .orElseThrow(() -> new KardexException("Este medicamento nao possui esta dose disponivel"));

        stockService.subtractFromStock(medication, dose.getDose());

        var containment = mapper.fromCreateContainmentDto(data);
        containment.setProcessoClinico(process);
        containment.setMedico(worker);
        containment.setDose(dose);
        containment.setMedicamento(medication);

        process.getContencoes().add(containment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContencaoDTO> getAllCointainments(Long processId) {
        var process = processService.getValidProcess(processId);

        var containments = process.getContencoes();
        return mapper.toContainmentDtoList(containments);
    }
}
