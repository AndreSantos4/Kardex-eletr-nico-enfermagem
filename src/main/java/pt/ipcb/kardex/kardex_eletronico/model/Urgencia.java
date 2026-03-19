package pt.ipcb.kardex.kardex_eletronico.model;

public enum Urgencia {
    BAIXA("Baixa"),
    MODERADA("Moderada"),
    NORMAL("Normal"),
    ALTA("Alta");
    
    public final String nome;
    
    Urgencia(String nome) {
        this.nome = nome;
    }
}
