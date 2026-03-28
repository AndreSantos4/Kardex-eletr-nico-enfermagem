package pt.ipcb.kardex.kardex_eletronico.dto.worker;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public record WorkerActivitySummary(
    @JsonProperty("lastAccess") @JsonFormat(pattern = "dd/MM/yyyy:HH:mm:ss") LocalDateTime lastAcess,
    @JsonProperty("shiftsThisMonth") int shiftsThisMonth,
    @JsonProperty("incidentsThisMonth") int incidentsThisMonth,
    @JsonProperty("administrationsThisMonth") int administrationsThisMonth
) {

}
