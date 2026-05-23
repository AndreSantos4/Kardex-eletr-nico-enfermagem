package pt.ipcb.kardex.kardex_eletronico.controller.filter;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegisto;

import java.time.LocalDate;

public record RecordFilter(
        TipoRegisto type,
        LocalDate date,
        String search
) {
}
