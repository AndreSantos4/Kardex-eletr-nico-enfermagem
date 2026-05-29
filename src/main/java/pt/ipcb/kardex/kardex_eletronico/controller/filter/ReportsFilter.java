package pt.ipcb.kardex.kardex_eletronico.controller.filter;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.YearMonth;

public record ReportsFilter(
    @JsonProperty("periodo") @JsonFormat(pattern = "MM/yyyy") YearMonth period,
    @JsonProperty("de") LocalDate de,
    @JsonProperty("ate") LocalDate ate
) {


}
