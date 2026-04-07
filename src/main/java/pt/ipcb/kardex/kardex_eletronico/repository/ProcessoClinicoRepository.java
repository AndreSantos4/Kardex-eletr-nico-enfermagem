package pt.ipcb.kardex.kardex_eletronico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

@Repository
public interface ProcessoClinicoRepository extends JpaRepository<ProcessoClinico, Long>{

    boolean existsByUtente(Utente patient);

    Optional<ProcessoClinico> findByUtenteAndAltaFalse(Utente patient);

    @Query("SELECT p FROM ProcessoClinico p JOIN FETCH p.utente WHERE p.alta = false")
    List<ProcessoClinico> findAllActive();
}
