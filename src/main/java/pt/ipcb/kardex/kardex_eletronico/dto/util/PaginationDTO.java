package pt.ipcb.kardex.kardex_eletronico.dto.util;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PaginationDTO(int offset, int count) {
}
