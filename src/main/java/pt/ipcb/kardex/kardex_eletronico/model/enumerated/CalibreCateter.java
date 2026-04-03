package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum CalibreCateter {
    CATETER_VENENOSO_PERIFERICO("Cateter venenoso periférico"),
    CATETER_VENENOSO_CENTRAL("Cateter venenoso central"),
    PICC("PICC"),
    PORT_A_CATH("Port a cath"),
    CATETER_HEMODIALISE("Cateter hemodiálise"),
    CATETER_DUPLO_J ("Cateter duplo J"),
    CATETER_URINARIO("Cateter urinário"),
    CATETER_NASAL("Cateter nasal");
    
    public final String nome;
    
    CalibreCateter(String nome) {
        this.nome = nome;
    }
}
