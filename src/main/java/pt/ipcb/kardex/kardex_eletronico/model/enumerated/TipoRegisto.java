package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum TipoRegisto {
    AUTH("Autenticação"),
    PATIENT_ACCEPTANCE("Utente admitido"),
    PATIENT_DISCHARGE("Utente liberado"),
    USER_CREATION("Criacao de utilizador"),
    PASSWORD_RESET_REQUEST("Pedido de alteracao de password"),
    ADMINISTRATION("Administracao de medicacao");
    
    public final String nome;
    
    TipoRegisto(String nome) {
        this.nome = nome;
    }
}
