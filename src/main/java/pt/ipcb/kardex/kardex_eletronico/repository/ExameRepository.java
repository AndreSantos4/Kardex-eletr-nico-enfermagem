package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Exame;

import java.util.List;

@Repository
public interface ExameRepository extends JpaRepository<Exame, Long> {

    List<Exame> findByProcessoClinicoId(Long processId);
}
