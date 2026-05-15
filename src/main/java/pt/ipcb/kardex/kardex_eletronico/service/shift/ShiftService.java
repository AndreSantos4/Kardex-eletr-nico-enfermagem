package pt.ipcb.kardex.kardex_eletronico.service.shift;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.*;

import java.util.List;

public interface ShiftService {
    
    void createShift(CreateShiftDTO data);

    void editShift(Long shiftId, CreateShiftDTO data);

    void deleteShift(Long shiftId);

    void assignNurses(Long shiftId, AssignNursesDTO data);

    List<TurnoDTO> getAllShifts();

    PassagemTurnoDTO getShiftChange(Long shiftId);

    void executeShiftChange(Long shiftId, CreateShiftChangeDTO data);

    TurnoDTO getShift(Long shiftId);

    List<PendenciaDTO> getPendingIssues(Long shiftId);
}
