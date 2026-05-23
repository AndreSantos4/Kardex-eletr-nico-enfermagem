package pt.ipcb.kardex.kardex_eletronico.service.record;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import pt.ipcb.kardex.kardex_eletronico.controller.filter.RecordFilter;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Registo;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegisto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RecordSpecification {

    public static Specification<Registo> withFilter(RecordFilter filter) {
        return Specification
                .where(hasType(filter.type()))
                .and(hasDate(filter.date()))
                .and(matchesSearch(filter.search()));
    }

    private static Specification<Registo> hasType(TipoRegisto type) {
        return (root, query, cb) -> type == null ? null
                : cb.equal(root.get("tipoRegisto"), type);
    }

    private static Specification<Registo> hasDate(LocalDate date) {
        return (root, query, cb) -> {
            if (date == null) return null;

            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();

            return cb.and(
                    cb.greaterThanOrEqualTo(root.get("stamp"), start),
                    cb.lessThan(root.get("stamp"), end)
            );
        };
    }

    private static Specification<Registo> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;

            query.distinct(true);
            String pattern = "%" + search.toLowerCase() + "%";

            Join<Registo, Utilizador> utilizador = root.join("utilizador", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("mensagem")), pattern),
                    cb.like(cb.lower(root.get("detalhes")), pattern),
                    cb.like(cb.lower(root.get("ip")), pattern),
                    cb.like(cb.lower(utilizador.get("nome")), pattern)
            );
        };
    }
}
