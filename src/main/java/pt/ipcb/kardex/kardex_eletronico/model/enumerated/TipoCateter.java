package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum TipoCateter {
    VENOSO_PERIFERICO("Cateter venenoso periférico"),
    VENOSO_CENTRAL("Cateter venenoso central"),
    PICC("PICC"),
    PORT_A_CATH("Port a cath"),
    HEMODIALISE("Cateter hemodiálise"),
    DUPLO_J ("Cateter duplo J"),
    URINARIO("Cateter urinário"),
    NASAL("Cateter nasal");
    
    public final String nome;
    
    TipoCateter(String nome) {
        this.nome = nome;
    }
}
