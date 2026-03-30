package pt.ipcb.kardex.kardex_eletronico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.ipcb.kardex.kardex_eletronico.model.entity.IpBloqueado;

@Repository
public interface IpRepository extends JpaRepository<IpBloqueado, Long>{
    
    void deleteByEnderecoIP(String ip);

    boolean existsByEnderecoIP(String ip);
}
