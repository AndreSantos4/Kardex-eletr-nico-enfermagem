package pt.ipcb.kardex.kardex_eletronico.dto.plan;

import java.util.List;

public record CreateCarePlanDTO(
    List<CreateNursingDiagnosticDTO> diagnosticos
){}