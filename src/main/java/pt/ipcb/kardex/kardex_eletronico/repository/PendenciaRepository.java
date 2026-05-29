package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Pendencia;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;

import java.util.Optional;

@Repository
public interface PendenciaRepository extends JpaRepository<Pendencia, Long> {


    Optional<Pendencia> findByIdObjetoAndTipoAndTurnoId(Long objectId, TipoPendencia tipo, Long shiftId);

    Optional<Pendencia> findByUtenteIdAndTipoAndTurnoId(Long patientId, TipoPendencia tipo, Long shiftId);
}
