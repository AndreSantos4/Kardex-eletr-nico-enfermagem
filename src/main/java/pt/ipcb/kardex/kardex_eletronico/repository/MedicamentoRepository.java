package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.FormaFarmaceutica;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.ViaAdministracao;;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long>{

    @Query("SELECT COUNT(DISTINCT m.nome) FROM Medicamento m")
    Long countUniqueMedications();

	Optional<Medicamento> findByNomeAndPrincipioAtivoAndFormaFarmaceuticaAndViaAdministracao(
	        String nome, 
			String principioAtivo,
			FormaFarmaceutica formaFarmaceutica, 
			ViaAdministracao viaAdministracao
	);

	@Modifying
	@Query("DELETE FROM LoteMedicamento l WHERE l.validade < :data")
	void deleteExpiredBatches(@Param("data") LocalDate data);

	@Modifying
	@Query("DELETE FROM LoteMedicamento l WHERE l.quantidade <= 0")
	void deleteEmptyBatches();

	@Query("""
		SELECT a.prescricao.medicamento.nome, COUNT(a), SUM(a.prescricao.dose.dose), a.prescricao.medicamento.unidadeMedida
		FROM AdministracaoMedicacao a
		WHERE a.administrado = true
		AND a.prescricao.dose IS NOT NULL
		AND (CAST(:de AS date) IS NULL OR a.data >= :de)
		AND (CAST(:ate AS date) IS NULL OR a.data <= :ate)
		GROUP BY a.prescricao.medicamento.id, a.prescricao.medicamento.nome, a.prescricao.medicamento.unidadeMedida
		ORDER BY COUNT(a) DESC
		LIMIT 10
	""")
	List<Object[]> findTop10MedicamentosDoMes(
			@Param("de") LocalDate de,
			@Param("ate") LocalDate ate
	);
}
