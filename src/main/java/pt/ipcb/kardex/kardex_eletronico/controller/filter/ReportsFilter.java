package pt.ipcb.kardex.kardex_eletronico.controller.filter;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public record ReportsFilter(
    @JsonProperty("de") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate de,
    @JsonProperty("ate") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate ate
) {
}
