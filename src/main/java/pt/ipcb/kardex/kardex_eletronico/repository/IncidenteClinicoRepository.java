package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.IncidenteClinico;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public interface IncidenteClinicoRepository extends JpaRepository<IncidenteClinico, Long> {

    @Query("""
        SELECT COUNT(i) FROM IncidenteClinico i
        WHERE i.data >= :de
        AND i.data <= :ate
    """)
    long countIncidents(
            @Param("de") LocalDateTime de,
            @Param("ate") LocalDateTime ate
    );
}
