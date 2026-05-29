package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Cateter;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CateterRepository extends JpaRepository<Cateter, Long> {

    @Query("""
        SELECT c.tipo, c.calibre, COUNT(c)
        FROM Cateter c
        WHERE c.dataInsercao >= :de
        AND c.dataInsercao <= :ate
        GROUP BY c.tipo, c.calibre
        ORDER BY COUNT(c) DESC
    """)
    List<Object[]> countCateteresUsados(
            @Param("de") LocalDateTime de,
            @Param("ate") LocalDateTime ate
    );
}
