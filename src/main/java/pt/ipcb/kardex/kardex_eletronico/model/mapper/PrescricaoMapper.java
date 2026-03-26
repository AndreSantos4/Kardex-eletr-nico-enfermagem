package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreatePrescriptionDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.PrescricaoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Prescricao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;

@Mapper(componentModel = "spring")
public interface PrescricaoMapper {
    PrescricaoDTO toDTO(Prescricao utilizador);

    Prescricao toEntity(PrescricaoDTO dto);

    Prescricao fromCreate(CreatePrescriptionDTO dto, Medicamento medicamento);

    List<PrescricaoDTO> toDTOList(List<Prescricao> utilizadores);
}
