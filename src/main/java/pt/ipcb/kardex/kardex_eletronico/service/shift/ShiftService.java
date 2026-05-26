package pt.ipcb.kardex.kardex_eletronico.service.shift;

import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.ShiftChangeFilter;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.*;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.atribuicao.AssignNursesDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.util.Pagination;

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

    void validateShiftChange(Long shiftId, CreateShiftChangeDTO data);

    void sendBackShiftChange(Long shiftId);

    @Transactional(readOnly = true)
    TurnoDTO getPendingShift();

    TurnoDTO getCurrentShift();

    List<PassagemTurnoDTO> getShiftHistory(Pagination pagination, ShiftChangeFilter filter);

    DetailedShiftChangeDTO getDetailedShiftChange(Long changeId);
}
