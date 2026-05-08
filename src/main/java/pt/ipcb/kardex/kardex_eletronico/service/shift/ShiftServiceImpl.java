package pt.ipcb.kardex.kardex_eletronico.service.shift;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoTurno;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;
import pt.ipcb.kardex.kardex_eletronico.service.worker.WorkerService;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService{

    private final TurnoRepository repository;
    private final TurnoMapper mapper;
    private final WorkerService workerService;

    @Override
    @Transactional
    public void CreateShift(CreateShiftDTO data) {
        var shift = mapper.fromCreate(data);

        switch (data.tipo()) {
            case TipoTurno.CUSTOM:
                if(shift.getInicio() == null || shift.getFim() == null){
                    throw new KardexException("Para turnos com horario personalizado, e necessario especifar a hora de inicio e de fim");
                }
                if(shift.getInicio().isAfter(shift.getFim())){
                    throw new KardexException("A hora de fim nao pode ser inferior a hora de inicio");
                }
            break;
            case TipoTurno.MANHA:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(8, 0)));
                shift.setFim(LocalDateTime.of(data.data(), LocalTime.of(16, 0)));
                break;
            case TipoTurno.TARDE:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(16, 0)));
                shift.setFim(LocalDateTime.of(data.data().plusDays(1), LocalTime.of(0, 0)));
                break;
            case TipoTurno.NOITE:
                shift.setInicio(LocalDateTime.of(data.data(), LocalTime.of(0, 0)));
                shift.setFim(LocalDateTime.of(data.data(), LocalTime.of(8, 0)));
                break;
        }

        var workers = data.IdEnfermeiros()
            .stream()
            .map(id -> {
            var worker = workerService.getWorker(id);
            if(worker.getDados().getRole() != Role.ENFERMEIRO){
                throw new KardexException("So podem ser alocados enfermeiros a um turno");
            }
            worker.getTurnos().add(shift);

            return worker;
        })
        .toList();

        shift.setEnfermeiros(new HashSet<>(workers));

        repository.save(shift);
    }
}
