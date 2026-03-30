package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum NivelRegisto {
    INFO("Informação"),
    ALERTA("Alerta"),
    ERRO("Erro");
    
    public final String nome;
    
    NivelRegisto(String nome) {
        this.nome = nome;
    }
}
