package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum UnidadeMedida {
    GRAMAS("g"),
    MILIGRAMAS("mg"),
    MICROGRAMAS("μg"),
    MILILITROS("ml");
    
    public final String simbolo;
    
    UnidadeMedida(String simbolo) {
        this.simbolo = simbolo;
    }
}
