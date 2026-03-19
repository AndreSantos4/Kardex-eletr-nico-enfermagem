package pt.ipcb.kardex.kardex_eletronico.model;

public enum NivelRegisto {
    INFO("Informação"),
    ALERTA("Alerta"),
    ERRO("Erro");
    
    public final String nome;
    
    NivelRegisto(String nome) {
        this.nome = nome;
    }
}
