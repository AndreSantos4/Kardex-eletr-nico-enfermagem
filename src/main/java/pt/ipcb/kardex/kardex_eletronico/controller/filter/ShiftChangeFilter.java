package pt.ipcb.kardex.kardex_eletronico.controller.filter;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import pt.ipcb.kardex.kardex_eletronico.model.entity.PassagemTurno;

import java.time.LocalDate;

public record ShiftChangeFilter(
        LocalDate from,
        LocalDate to,
        String search
) {

    public Specification<PassagemTurno> toSpecification() {
        return Specification
                .where(fromDate(from))
                .and(toDate(to))
                .and(search(search));
    }

    private static Specification<PassagemTurno> fromDate(LocalDate from) {
        return (root, query, cb) -> from == null ? null
                : cb.greaterThanOrEqualTo(
                root.get("turno").get("inicio"),
                from.atStartOfDay()
        );
    }

    private static Specification<PassagemTurno> toDate(LocalDate to) {
        return (root, query, cb) -> to == null ? null
                : cb.lessThanOrEqualTo(
                root.get("turno").get("inicio"),
                to.plusDays(1).atStartOfDay()
        );
    }

    private static Specification<PassagemTurno> search(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;
            String pattern = "%" + search.toLowerCase() + "%";

            var enfermeiro = root.join("turno").join("enfermeiros", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("observacoes")), pattern),
                    cb.like(cb.lower(enfermeiro.get("dados").get("nome")), pattern)
            );
        };
    }
}
