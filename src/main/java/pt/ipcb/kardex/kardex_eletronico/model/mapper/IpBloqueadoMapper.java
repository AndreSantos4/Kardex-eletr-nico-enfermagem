package pt.ipcb.kardex.kardex_eletronico.model.mapper;

import org.mapstruct.Mapper;

import pt.ipcb.kardex.kardex_eletronico.dto.ip.IpAdressBlockDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.IpBloqueado;

@Mapper(componentModel = "spring")
public interface IpBloqueadoMapper {
    IpBloqueado fromCreate(IpAdressBlockDTO dto);
}
