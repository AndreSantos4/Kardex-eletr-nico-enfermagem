package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PassagemTurno;

import java.util.List;

@Repository
public interface PassagemTurnoRepository extends JpaRepository<PassagemTurno, Long> {

    List<PassagemTurno> findByProximoTurnoId(Long turnoId);
}
