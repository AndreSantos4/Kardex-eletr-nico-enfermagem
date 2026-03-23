package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum TipoNotaEvolucaoClinica {
    S("Subjetivo"),
    O("Objetivo"),
    A("Avaliação"),
    P("Plano");
    
    public final String nome;
    
    TipoNotaEvolucaoClinica(String nome) {
        this.nome = nome;
    }
}
