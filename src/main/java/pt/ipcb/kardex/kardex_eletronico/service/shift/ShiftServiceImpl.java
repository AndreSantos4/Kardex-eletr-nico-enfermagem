package pt.ipcb.kardex.kardex_eletronico.service.shift;

import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateIncidentDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.IncidenteMapper;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.IncidenteRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService{

    private final TurnoRepository repository;
    private final TurnoMapper mapper;
    private final IncidenteRepository incidenteRepository;
    private final IncidenteMapper incidenteMapper;
    
    private final WorkerService workerService;

    @Override
    public void CreateShift(CreateShiftDTO data) {
        var shift = mapper.fromCreate(data);
        repository.save(shift);
    }

    @Override
    public void createIncident(CreateIncidentDTO data, HttpServletRequest request) {
        var worker = workerService.getAutenticatedWorker(request);
        var shift = workerService.getCurrentShift(worker.getId());

        var incident = incidenteMapper.fromCreate(data);
        incident.setFuncionario(worker);
        incident.setTurno(shift);

        incidenteRepository.save(incident);
    }
}
