package pt.ipcb.kardex.kardex_eletronico.repository;

import java.security.cert.PKIXRevocationChecker.Option;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {
    @Query(
        "SELECT t FROM Turno t LEFT JOIN t.passagemTurno pt WHERE (pt IS NULL OR pt.ativo = true) AND t.fim < :now"
    )
    List<Turno> findAllWithoutPassagemTurnoBeforeNow(
        @Param("now") LocalDateTime now
    );

    Optional<
        Turno
    > findFirstByPassagemTurnoPendenteTrueAndEnfermeiros_IdOrderByInicioDesc(
        Long workerId
    );

    Optional<Turno> findFirstByFimAfterOrderByInicioAsc(LocalDateTime now);

    @Query(
        "SELECT t FROM Turno t JOIN t.enfermeiros f WHERE f.id = :id AND t.inicio <= :now AND t.fim >= :now"
    )
    Optional<Turno> findTurnoAtivoByFuncionarioId(
        @Param("id") Long id,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT t FROM Turno t WHERE t.inicio < :now AND t.fim > :now")
    Optional<Turno> findCurrentShift(@Param("now") LocalDateTime now);

    @Query(
        "SELECT COUNT(t) > 0 FROM Turno t WHERE t.inicio < :end AND t.fim > :start AND t.id <> :excludeId"
    )
    boolean existsOverlap(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("excludeId") Long excludeId
    );
}
