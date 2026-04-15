package pt.ipcb.kardex.kardex_eletronico.service.worker;

import java.util.List;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.FuncionarioDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.ShiftSummaryDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.worker.WorkerActivitySummary;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

public interface WorkerService {

    FuncionarioDTO getWorkerFromUserId(Long userId);

    void createWorkerByUser(Utilizador user);

    List<TurnoDTO> getWorkerShifts(Long id, int range);

    void addToShift(Long workerId, Long shiftId);

    void removeFromShift(Long workerId, Long shiftId);

    Funcionario getAutenticatedWorker();

    Turno getCurrentShift(Long id);

    List<ShiftSummaryDTO> getWorkerShiftsInfo(Long id);

    WorkerActivitySummary getWorkerActivitySummary(Long workerId);

    Funcionario getMedicById(long medicoId);
    
    List<FuncionarioDTO> getAllMedics();

    long getActiveNursesCount();
}
