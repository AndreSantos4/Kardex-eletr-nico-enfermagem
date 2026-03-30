package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Sessao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long>{

    Optional<Sessao> findByUtilizador(Utilizador utilizador);
    void deleteByUtilizador(Utilizador utilizador);
    void deleteAllByInicioBefore(LocalDateTime cutoff);
    List<Sessao> findAllByInicioAfter(LocalDateTime cutoff);
}
