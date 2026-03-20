package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum TipoExame {
    HEMOGRAMA_COMPLETO("Hemograma Completo"),
    PAINEL_METABOLICO("Painel metabólico"),
    FUNCAO_HEPATICA("Função hepática"),
    FUNCAO_TIROIDE("Função tiroide"),
    NIVEIS_VITAMINAS("Níveis de vitaminas");
    
    public final String nome;
    
    TipoExame(String nome) {
        this.nome = nome;
    }
}
