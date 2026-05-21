package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum GravidadeIncidente {
    LIGEIRA("Baixa"),
    MODERADA("Moderada"),
    GRAVE("Normal"),
    CRITICA("Alta");
    
    public final String nome;
    
    GravidadeIncidente(String nome) {
        this.nome = nome;
    }
}
