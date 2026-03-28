package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.TentativaLogin;

@Repository
public interface TentativaLoginRepository extends JpaRepository<TentativaLogin, Long> {
    List<TentativaLogin> findByEnderecoIP(String ip);
    List<TentativaLogin> findByNumeroMecanografico(Long numeroMecanografico);
    @Query("""
        SELECT t.enderecoIP, t.numeroMecanografico, COUNT(t) as tentativas
        FROM TentativaLogin t
        WHERE t.sucesso = false
        AND t.tentouEm > :since
        GROUP BY t.enderecoIP, t.numeroMecanografico
        HAVING COUNT(t) > 3
        ORDER BY tentativas DESC
    """)
    List<Object[]> findStrangeActivity(@Param("since") LocalDateTime since);
    List<TentativaLogin> findBySucesso(boolean success);
}