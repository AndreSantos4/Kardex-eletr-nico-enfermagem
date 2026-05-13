package pt.ipcb.kardex.kardex_eletronico.service.shift;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.AssignNursesDTO;

import java.util.List;

import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.TurnoDTO;

public interface ShiftService {
    
    void createShift(CreateShiftDTO data);

    void editShift(Long shiftId, CreateShiftDTO data);

    void deleteShift(Long shiftId);

    void assignNurses(Long shiftId, AssignNursesDTO data);

    List<TurnoDTO> getAllShifts();
}
