package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum EstadoCateter {
    MUITO_MAU("Muito mau"),
    MAU("Mau"),
    NORMAL("Normal"),
    BOM("Bom"),
    MUITO_BOM("Muito bom");
    
    public final String nome;
    
    EstadoCateter(String nome) {
        this.nome = nome;
    }
}
