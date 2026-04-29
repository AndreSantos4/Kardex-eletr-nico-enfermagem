package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.AdministracaoMedicacao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Prescricao;

@Repository
public interface PrescricaoRepository extends JpaRepository<Prescricao, Long>{
    @Query("SELECT a FROM AdministracaoMedicacao a " +
       "WHERE a.prescricao.id = :prescricaoId " +
       "ORDER BY a.data DESC " +
       "LIMIT 1")
    Optional<AdministracaoMedicacao> findMostRecentByPrescricao(
        @Param("prescricaoId") Long prescricaoId);

    @Query("SELECT COUNT(a) FROM AdministracaoMedicacao a " +
       "WHERE a.prescricao.id = :prescricaoId " +
       "AND a.data >= :desde")
    long countByPrescricaoInLastDays(
        @Param("prescricaoId") Long prescricaoId,
        @Param("desde") LocalDateTime desde);
}
