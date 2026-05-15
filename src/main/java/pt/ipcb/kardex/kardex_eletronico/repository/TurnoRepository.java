package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long>{
    Optional<Turno> findFirstByInicioAfterOrderByInicioDesc(LocalDateTime now);
}