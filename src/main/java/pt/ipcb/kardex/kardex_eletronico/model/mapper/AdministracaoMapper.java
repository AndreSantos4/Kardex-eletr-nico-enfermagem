package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.prescription.AdministracaoDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.prescription.CreateAdministrationDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AdministracaoMedicacao;

@Mapper(componentModel = "spring")
public interface AdministracaoMapper {
    AdministracaoDTO toDTO(AdministracaoMedicacao administracao);

    AdministracaoMedicacao toEntity(AdministracaoDTO dto);

    AdministracaoMedicacao fromCreate(CreateAdministrationDTO dto);

    List<AdministracaoDTO> toDTOList(List<AdministracaoMedicacao> prescricoes);
}
