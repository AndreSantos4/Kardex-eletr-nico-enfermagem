package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum GravidadeIncidente {
    BAIXA("Baixa"),
    MODERADA("Moderada"),
    NORMAL("Normal"),
    ALTA("Alta");
    
    public final String nome;
    
    GravidadeIncidente(String nome) {
        this.nome = nome;
    }
}
