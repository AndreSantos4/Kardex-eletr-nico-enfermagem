package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Funcionario;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

@Repository
public interface WorkerRepository extends JpaRepository<Funcionario, Long> {

    @Query("SELECT t FROM Funcionario f JOIN f.turnos t WHERE f.id = :id AND t.inicio >= :from AND t.inicio < :to ORDER BY t.inicio ASC")
    List<Turno> findNextTurnos(@Param("id") Long id, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT t FROM Funcionario f JOIN f.turnos t WHERE f.id = :id AND t.inicio < :from AND t.inicio >= :to ORDER BY t.inicio DESC")
    List<Turno> findPreviousTurnos(@Param("id") Long id, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
