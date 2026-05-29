package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.AdministracaoMedicacao;

import java.time.LocalDate;

@Repository
public interface AdministracaoRepository extends JpaRepository<AdministracaoMedicacao, Long>{

    long countByAdministrado(boolean b);

    @Query("""
        SELECT COUNT(a) FROM AdministracaoMedicacao a
        WHERE a.administrado = :administrado
        AND (CAST(:de AS date) IS NULL OR a.data >= :de)
        AND (CAST(:ate AS date) IS NULL OR a.data <= :ate)
    """)
    long countByAdministradoFiltered(
            @Param("administrado") boolean administrado,
            @Param("de") LocalDate de,
            @Param("ate") LocalDate ate
    );
}
