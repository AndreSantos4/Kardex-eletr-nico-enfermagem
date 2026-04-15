package pt.ipcb.kardex.kardex_eletronico.service.shift;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public void CreateShift(CreateShiftDTO data) {
        var shift = mapper.fromCreate(data);
        repository.save(shift);
    }

    @Override
    @Transactional
    public void createIncident(CreateIncidentDTO data){
        var worker = workerService.getAutenticatedWorker();
        var shift = workerService.getCurrentShift(worker.getId());

        var incident = incidenteMapper.fromCreate(data);
        incident.setFuncionario(worker);
        incident.setTurno(shift);

        incidenteRepository.save(incident);
    }
}
