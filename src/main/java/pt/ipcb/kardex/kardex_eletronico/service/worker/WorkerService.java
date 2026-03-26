package pt.ipcb.kardex.kardex_eletronico.service.worker;

import java.util.List;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface WorkerService {

    void createWorkerByUser(Utilizador user);

    List<TurnoDTO> getWorkerShifts(Long id, int range);

    void addToShift(Long workerId, Long shiftId);

    void removeFromShift(Long workerId, Long shiftId);

}
