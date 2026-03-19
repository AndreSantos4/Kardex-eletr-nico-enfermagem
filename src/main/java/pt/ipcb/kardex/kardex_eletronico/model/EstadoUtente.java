package pt.ipcb.kardex.kardex_eletronico.model;

public enum EstadoUtente {
    EM_ANALISE("Em análise"),
    INTERNADO("Internado"),
    INATIVO("Inativo");
    
    public final String nome;
    
    EstadoUtente(String nome) {
        this.nome = nome;
    }
}
