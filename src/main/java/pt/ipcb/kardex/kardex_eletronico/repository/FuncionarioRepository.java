package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    @Query("SELECT t FROM Funcionario f JOIN f.turnos t WHERE f.id = :id AND t.inicio >= :from AND t.inicio < :to ORDER BY t.inicio ASC")
    List<Turno> findNextTurnos(@Param("id") Long id, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT t FROM Funcionario f JOIN f.turnos t WHERE f.id = :id AND t.inicio <= :from AND t.inicio > :to ORDER BY t.inicio DESC")
    List<Turno> findPreviousTurnos(@Param("id") Long id, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT f FROM Funcionario f JOIN f.dados u WHERE u.id = :id")
    Optional<Funcionario> findByUserId(@Param("id") Long id);

    @Query("SELECT t FROM Funcionario f JOIN f.turnos t WHERE f.id = :id AND t.inicio <= :now AND t.fim >= :now")
    Turno findCurrentTurno(@Param("id") Long id, @Param("now") LocalDateTime now);

    @Query("SELECT t.id, COUNT(i) FROM Turno t LEFT JOIN t.incidentes i WHERE t.id IN :ids GROUP BY t.id")
    List<Object[]> countIncidentsByTurnoIds(@Param("ids") List<Long> ids);

    @Query("SELECT t.id, COUNT(a) FROM Turno t LEFT JOIN t.administracoes a WHERE t.id IN :ids GROUP BY t.id")
    List<Object[]> countAdministracoesByTurnoIds(@Param("ids") List<Long> ids);

    @Query("SELECT COUNT(t) FROM Funcionario f JOIN f.turnos t WHERE f.id = :id AND MONTH(t.inicio) = MONTH(CURRENT_DATE) AND YEAR(t.inicio) = YEAR(CURRENT_DATE)")
    int getShiftsCountThisMonthById(@Param("id") Long id);

    @Query("SELECT COUNT(i) FROM Funcionario f JOIN f.turnos t JOIN t.incidentes i WHERE f.id = :id AND MONTH(t.inicio) = MONTH(CURRENT_DATE) AND YEAR(t.inicio) = YEAR(CURRENT_DATE)")
    int getIncidentsCountThisMonthById(@Param("id") Long id);

    @Query("SELECT COUNT(a) FROM Funcionario f JOIN f.turnos t JOIN t.administracoes a WHERE f.id = :id AND MONTH(t.inicio) = MONTH(CURRENT_DATE) AND YEAR(t.inicio) = YEAR(CURRENT_DATE)")
    int getAdministrationsCountThisMonth(@Param("id") Long id);

    List<Funcionario> findByDadosRole(Role role);

    long countByDadosRoleAndDadosAtivo(Role enfermeiro, boolean ativo);
}
