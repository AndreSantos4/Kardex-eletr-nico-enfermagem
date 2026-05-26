package pt.ipcb.kardex.kardex_eletronico.service.shift.issues;

import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.model.entity.AtribuicaoUtente;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Pendencia;
import pt.ipcb.kardex.kardex_eletronico.model.entity.ProcessoClinico;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Turno;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;

import java.util.List;

public interface IssuesService {

    List<Pendencia> buildIssues(ProcessoClinico process, Turno shift, AtribuicaoUtente atribuicaoUtente);

    public void executeDefinedIssue(Long objectId, TipoPendencia tipo);

    @Transactional
    void executeUndefinedIssue(Long patientId, TipoPendencia tipo);
}
