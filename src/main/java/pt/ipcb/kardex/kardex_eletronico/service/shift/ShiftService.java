package pt.ipcb.kardex.kardex_eletronico.service.shift;

import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.CreateIncidenteDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;

public interface ShiftService {
    
    void CreateShift(CreateShiftDTO data);

    void createIncident(CreateIncidenteDTO data);
}
