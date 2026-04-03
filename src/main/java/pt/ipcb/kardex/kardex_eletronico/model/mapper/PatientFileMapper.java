package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.patient.CreatePatientFileDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.process.CreateProcessDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

@Mapper(componentModel = "spring")
public interface PatientFileMapper {
    Utente toUtente(CreatePatientFileDTO data);

    CreateProcessDTO toProcessDTO(CreatePatientFileDTO data);
}
