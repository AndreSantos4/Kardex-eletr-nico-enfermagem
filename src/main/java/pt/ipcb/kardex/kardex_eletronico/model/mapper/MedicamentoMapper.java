package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.LoteMedicamentoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.LoteMedicamento;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;

@Mapper(componentModel = "spring")
public interface MedicamentoMapper {
    MedicamentoDTO toDTO(Medicamento utilizador, BigDecimal quantidade);

    Medicamento toEntity(MedicamentoDTO dto);

    Medicamento fromCreate(CreateMedicationDTO dto);

    List<MedicamentoDTO> toDTOList(List<Medicamento> medicamentos);

    LoteMedicamentoDTO toDTO(LoteMedicamento lote);
}
