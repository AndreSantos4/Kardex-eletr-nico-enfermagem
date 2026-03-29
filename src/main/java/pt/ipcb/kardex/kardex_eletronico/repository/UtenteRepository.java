package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Utente;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.EstadoUtente;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long>{

    long countByEstado(EstadoUtente internado);

}
