package pt.ipcb.kardex.kardex_eletronico.service.process.parameters;

import pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos.*;

import java.util.List;

public interface ParametersService {

    public void registerCateter(Long processId, CreateCateterDTO data);

    public List<CateterDTO> getAllCateteres(Long processId);

    public void registerIncident(Long processId, CreateIncidenteDTO data);

    public List<IncidenteDTO> getAllIncidents(Long processId);

    public void registerContainment(Long processId, CreateContencaoDTO data);

    public List<ContencaoDTO> getAllCointainments(Long processId);
}
