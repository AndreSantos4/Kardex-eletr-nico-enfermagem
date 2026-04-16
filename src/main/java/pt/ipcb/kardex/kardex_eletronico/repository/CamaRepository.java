package pt.ipcb.kardex.kardex_eletronico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pt.ipcb.kardex.kardex_eletronico.dto.process.CamaDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Cama;

public interface CamaRepository extends JpaRepository<Cama, String>{

    List<CamaDTO> findByOcupada(boolean occupied);

}
