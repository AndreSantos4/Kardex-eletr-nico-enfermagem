package pt.ipcb.kardex.kardex_eletronico.repository;

import java.time.LocalDate;
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
}
