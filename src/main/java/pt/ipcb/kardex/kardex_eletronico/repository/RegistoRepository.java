package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Registo;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegisto;

@Repository
public interface RegistoRepository extends JpaRepository<Registo, Long>{

    long countByTipoRegistoAndStampAfter(TipoRegisto patientAcceptance, LocalDateTime after);

    Page<Registo> findAll(Specification<Registo> registoSpecification, Pageable pageable);
}
