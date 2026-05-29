package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.NotaEvolucaoClinica;

import java.util.List;

@Repository
public interface NotaClinicaRepository extends JpaRepository<NotaEvolucaoClinica, Long> {

    List<NotaEvolucaoClinica> findByProcessoClinicoIdOrderByDataDesc(Long processId);
}
