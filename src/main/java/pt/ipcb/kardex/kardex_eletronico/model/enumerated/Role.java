package pt.ipcb.kardex.kardex_eletronico.model.enumerated;

public enum Role {
    ADMIN("ADMIN"),
    MEDICO("MEDICO"),
    ENFERMEIRO_CHEFE("ENFERMEIRO_CHEFE"),
    ENFERMEIRO("ENFERMEIRO");
    
    private final String role;
    
    Role(String role) {
        this.role = role;
    }

    public String getRole(){
        return role;
    }
}
