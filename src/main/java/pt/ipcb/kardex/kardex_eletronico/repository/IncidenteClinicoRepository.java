package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.IncidenteClinico;

import java.time.LocalDate;

@Repository
public interface IncidenteClinicoRepository extends JpaRepository<IncidenteClinico, Long> {

    @Query("""
        SELECT COUNT(i) FROM IncidenteClinico i
        WHERE (CAST(:de AS date) IS NULL OR i.data >= :de)
        AND (CAST(:ate AS date) IS NULL OR i.data <= :ate)
    """)
    long countIncidents(
            @Param("de") LocalDate de,
            @Param("ate") LocalDate ate
    );
}
