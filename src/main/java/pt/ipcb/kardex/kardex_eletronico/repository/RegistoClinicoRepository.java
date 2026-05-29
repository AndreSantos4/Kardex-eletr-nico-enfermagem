package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.RegistoClinico;

import java.util.List;

@Repository
public interface RegistoClinicoRepository extends JpaRepository<RegistoClinico, Long> {


    List<RegistoClinico> findAllByProcessoId(Long processId);
}
