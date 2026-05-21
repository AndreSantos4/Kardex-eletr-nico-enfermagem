package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.CreateExamDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.exam.ExameDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Exame;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ExameMapper {

    Exame fromCreate(CreateExamDTO data);

    ExameDTO toDto(Exame data);

    Exame toEntity(ExameDTO data);

    List<ExameDTO> toDtoList(List<Exame> data);
}
