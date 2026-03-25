package pt.ipcb.kardex.kardex_eletronico.service.worker;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.WorkerRepository;

@Service
@RequiredArgsConstructor
public class WorkerServiceImpl implements WorkerService {

    private final WorkerRepository repository;
    private final TurnoMapper turnoMapper;

    @Override
    public void createWorkerByUser(Utilizador user) {
        var worker = new Funcionario(user);
        repository.save(worker);
    }

    @Override
    public List<TurnoDTO> getWorkerShifts(Long id, int range) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(range);
        List<Turno> turnos = range >= 0 ? repository.findNextTurnos(id, from, to) : 
                                            repository.findPreviousTurnos(id, from, to);

        return turnos
            .stream()
            .map(turnoMapper::toDTO)
            .toList();
    }
}
