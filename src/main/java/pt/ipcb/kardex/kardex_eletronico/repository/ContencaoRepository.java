package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Contencao;

@Repository
public interface ContencaoRepository extends JpaRepository<Contencao, Long> {
    boolean existsByDose_Id(Long doseId);
}
