package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Pendencia;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;

import java.util.Optional;

@Repository
public interface PendenciaRepository extends JpaRepository<Pendencia, Long> {


    Optional<Pendencia> findByIdObjetoAndTipo(Long objectId, TipoPendencia tipo);

    Optional<Pendencia> findByUtenteIdAndTipo(Long patientId, TipoPendencia tipo);
}
