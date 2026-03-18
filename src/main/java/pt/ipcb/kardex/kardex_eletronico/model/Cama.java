package pt.ipcb.kardex.kardex_eletronico.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "cama")
public class Cama {
    @Id
    public String id;
    
    @Column(name = "ocupada", nullable = false)
    public Boolean ocupada;
}
