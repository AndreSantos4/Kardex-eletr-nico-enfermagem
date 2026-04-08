package pt.ipcb.kardex.kardex_eletronico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.controller.filter.PatientState;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long>{

    long countByEstado(EstadoUtente internado);

    List<Utente> findByEstado(EstadoUtente parsedFilter);

}
