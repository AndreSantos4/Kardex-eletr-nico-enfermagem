package pt.ipcb.kardex.kardex_eletronico.model.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "pendencia")
public class Pendencia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;

	@JoinColumn(name = "id_turno", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
	public Turno turno;

	@Column(name = "tipo", nullable = false)
	public TipoPendencia tipo;

	@JoinColumn(name = "id_utente", nullable = false)
	@ManyToOne(fetch = FetchType.EAGER)
	public Utente utente;

	@Column(name = "id_objeto")
	public Long idObjeto;

	@Column(name = "descricao", nullable = false)
	public String descricao;

	@Column(name = "executada", nullable = false)
	public boolean executada = false;
}