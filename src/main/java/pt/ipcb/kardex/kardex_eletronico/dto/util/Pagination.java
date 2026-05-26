package pt.ipcb.kardex.kardex_eletronico.dto.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public record Pagination(int offset, int count) {

    public Pageable toPageable() {
        return PageRequest.of(
                offset() / count(),
                count()
        );
    }
}
