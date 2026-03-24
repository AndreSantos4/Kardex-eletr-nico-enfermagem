package pt.ipcb.kardex.kardex_eletronico.service;

import pt.ipcb.kardex.kardex_eletronico.dto.UtilizadorDTO;

public interface IUserService {
    void updateUser(Long id, UtilizadorDTO data);
    void deactivateUser(Long id);
    UtilizadorDTO getUserById(Long id);
}
