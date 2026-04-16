package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum FlagRisco {
    RISCO_FUGA("Risco de Fuga"),
    RISCO_AUTOMUTILACAO("Risco de Automutilacao"),
    RISCO_QUEDA("Risco de Queda"),
    RISCO_AGRESSIVIDADE("Risco de Agressividade");

    public final String nome;

    FlagRisco(String nome){
        this.nome = nome;
    }
}
