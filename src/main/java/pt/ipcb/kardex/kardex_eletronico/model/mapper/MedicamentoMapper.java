package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;

@Mapper(componentModel = "spring")
public interface MedicamentoMapper {
    MedicamentoDTO toDTO(Medicamento utilizador);

    Medicamento toEntity(MedicamentoDTO dto);

    Medicamento fromCreate(CreateMedicationDTO dto);

    List<MedicamentoDTO> toDTOList(List<Medicamento> utilizadores);
}
