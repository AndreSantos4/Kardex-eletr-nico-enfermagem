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

    @Query("SELECT t FROM Turno t LEFT JOIN t.passagemTurno pt WHERE (pt IS NULL OR pt.ativo = true) AND t.fim < :now")
    List<Turno> findAllWithoutPassagemTurnoBeforeNow(@Param("now") LocalDateTime now);

    Optional<Turno> findFirstByPassagemTurnoPendenteTrueAndEnfermeiros_IdOrderByInicioDesc(Long workerId);

    Optional<Turno> findFirstByFimAfterOrderByInicioAsc(LocalDateTime now);

    Optional<Turno> findFirstByOrderByInicioDesc();
}