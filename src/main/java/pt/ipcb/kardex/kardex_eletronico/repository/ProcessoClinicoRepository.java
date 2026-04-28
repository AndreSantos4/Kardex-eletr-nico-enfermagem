package pt.ipcb.kardex.kardex_eletronico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;

@Repository
public interface ProcessoClinicoRepository extends JpaRepository<ProcessoClinico, Long>{

    boolean existsByUtente(Utente patient);

    Optional<ProcessoClinico> findByUtenteAndAltaFalse(Utente patient);

    @Query("SELECT p FROM ProcessoClinico p JOIN FETCH p.utente WHERE p.alta = false")
    List<ProcessoClinico> findAllActive();

    @Query("SELECT p FROM ProcessoClinico p " +
       "JOIN FETCH p.utente u " +
       "LEFT JOIN FETCH p.sinaisVitais " +
       "LEFT JOIN FETCH p.prescricoes " +
       "WHERE u.id = :patientId AND p.alta = false")
    Optional<ProcessoClinico> findKardexProcess(@Param("patientId") Long patientId);
}
