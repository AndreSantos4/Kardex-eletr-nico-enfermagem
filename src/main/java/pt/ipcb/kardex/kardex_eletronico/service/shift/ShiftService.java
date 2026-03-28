package pt.ipcb.kardex.kardex_eletronico.service.shift;

import jakarta.servlet.http.HttpServletRequest;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateIncidentDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;

public interface ShiftService {
    
    void CreateShift(CreateShiftDTO data);

    void createIncident(CreateIncidentDTO data, HttpServletRequest request);
}
