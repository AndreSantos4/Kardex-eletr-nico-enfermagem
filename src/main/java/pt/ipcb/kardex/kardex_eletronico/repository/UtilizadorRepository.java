package pt.ipcb.kardex.kardex_eletronico.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

@Repository
public interface UtilizadorRepository extends JpaRepository<Utilizador, Long> {
    UserDetails findByNumeroMecanografico(Long numeroMecanografico);

    long countByAtivoTrue();
}
