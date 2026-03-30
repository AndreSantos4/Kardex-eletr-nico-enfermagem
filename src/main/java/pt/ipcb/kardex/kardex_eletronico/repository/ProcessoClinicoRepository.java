package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;

@Repository
public interface ProcessoClinicoRepository extends JpaRepository<ProcessoClinico, Long>{

}
