package pt.ipcb.kardex.kardex_eletronico.model;

public enum Role {
    ADMIN("Administrador"),
    MEDICO("Médico"),
    ENFERMEIRO_CHEFE("Enfermeiro Chefe"),
    ENFERMEIRO("Enfermeiro");
    
    private final String nome;
    
    Role(String nome) {
        this.nome = nome;
    }
}
