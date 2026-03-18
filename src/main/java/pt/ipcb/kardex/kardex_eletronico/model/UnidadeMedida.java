package pt.ipcb.kardex.kardex_eletronico.model;

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
