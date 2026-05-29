package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AtribuicaoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.Role;

import java.util.List;

@Repository
public interface AtribuicaoRepository extends JpaRepository<AtribuicaoUtente, Long> {

}
