package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PassagemTurno;

import java.util.List;

@Repository
public interface PassagemTurnoRepository extends JpaRepository<PassagemTurno, Long> {

    @EntityGraph(attributePaths = {"turno", "turno.pendencias", "proximoTurno", "turno.pendencias.utente"})
    Page<PassagemTurno> findAll(Specification<PassagemTurno> spec, Pageable pageable);
}
