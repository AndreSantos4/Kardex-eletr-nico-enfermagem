package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long>{
    Optional<Turno> findFirstByInicioAfterOrderByInicioDesc(LocalDateTime now);

    @Query("SELECT t FROM Turno t WHERE (t.passagemTurno IS NULL OR t.passagemTurno.ativo = false) AND t.inicio < :now")
    List<Turno> findAllWithoutPassagemTurnoBeforeNow(@Param("now") LocalDateTime now);

    boolean existsByProximoTurnoId(Long proximoTurnoId);
}