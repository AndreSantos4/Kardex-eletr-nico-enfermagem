package pt.ipcb.kardex.kardex_eletronico.model;

public enum TipoRegisto {
    AUTH("Autenticação"),
    DATABASE("Base de dados"),
    UTILIZADOR("Utilizador");
    
    public final String nome;
    
    TipoRegisto(String nome) {
        this.nome = nome;
    }
}
