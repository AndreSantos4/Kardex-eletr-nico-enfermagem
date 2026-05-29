package pt.ipcb.kardex.kardex_eletronico.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AdministracaoMedicacao;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Prescricao;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.PrescriptionState;

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

    @Query("SELECT p FROM Prescricao p " +
       "LEFT JOIN FETCH p.medicamento " +
       "LEFT JOIN FETCH p.dose " +
       "LEFT JOIN FETCH p.frequencia " +
       "LEFT JOIN FETCH p.medico " +
       "WHERE p.processo.id = :processId " +
       "AND (:state IS NULL OR p.estado = :state) " +
       "AND (:from IS NULL OR p.dataInicio >= :from) " +
       "AND (:to IS NULL OR p.dataInicio <= :to) " +
       "ORDER BY p.dataInicio DESC")
    List<Prescricao> findByProcessoIdFiltered(
        @Param("processId") Long processId,
        @Param("state") PrescriptionState state,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Modifying
    @Transactional
    @Query("UPDATE Prescricao p SET p.estado = :estado WHERE p.dataFim < :cutoff")
    int updateExpiredPrescriptions(
        @Param("cutoff") LocalDate cutoff, 
        @Param("estado") PrescriptionState estado
    );

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Prescricao p SET p.estado = :novoEstado, p.suspensao = null WHERE p.estado = :estadoAtual AND p.suspensao.dataRetorno <= :cutoff")
    int updateSuspendedPrescriptions(
        @Param("cutoff") LocalDate cutoff,
        @Param("estadoAtual") PrescriptionState estadoAtual,
        @Param("novoEstado") PrescriptionState novoEstado
    );

    @Query("""
        SELECT SUM(a.prescricao.dose.dose)
        FROM AdministracaoMedicacao a
        WHERE a.administrado = true
        AND a.data >= :since
        AND a.prescricao.medicamento.id = :medicamentoId
    """)
    BigDecimal sumDosesLast24h(@Param("since") LocalDateTime since, @Param("medicamentoId") Long medicamentoId);
}
