package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.PlanoCuidados;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;

@Repository
public interface PlanoRepository extends JpaRepository<PlanoCuidados, Long>{
    PlanoCuidados findTopByProcessoClinicoOrderByVersaoDesc(ProcessoClinico processo);
}
