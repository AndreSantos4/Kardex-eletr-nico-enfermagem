package pt.ipcb.kardex.kardex_eletronico.dto.parametros_clinicos;

import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoCateter;

public record CateterUsoDTO(TipoCateter tipo, String calibre, Long quantidade) {}