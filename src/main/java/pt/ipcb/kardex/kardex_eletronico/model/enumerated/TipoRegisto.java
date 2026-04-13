package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum TipoRegisto {
    AUTH("Autenticação"),
    PATIENT_ACCEPTANCE("Utente admitido"),
    PATIENT_DISCHARGE("Utente liberado");
    
    public final String nome;
    
    TipoRegisto(String nome) {
        this.nome = nome;
    }
}
