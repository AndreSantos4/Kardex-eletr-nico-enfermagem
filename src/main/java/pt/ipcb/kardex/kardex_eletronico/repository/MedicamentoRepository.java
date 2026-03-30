package pt.ipcb.kardex.kardex_eletronico.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long>{
    @Query("SELECT m FROM Medicamento m WHERE m.nome = :nome AND m.unidade = :unidade")
    Optional<Medicamento> findByNome(String nome, UnidadeMedida unidade);

    @Query("SELECT COUNT(DISTINCT m.nome) FROM Medicamento m")
    Long countUniqueMedications();
}
