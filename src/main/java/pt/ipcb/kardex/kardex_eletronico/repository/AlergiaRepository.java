package pt.ipcb.kardex.kardex_eletronico.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Alergia;

@Repository
public interface AlergiaRepository extends JpaRepository<Alergia, Long>{

    Optional<Alergia> findByNome(String nome);

}
