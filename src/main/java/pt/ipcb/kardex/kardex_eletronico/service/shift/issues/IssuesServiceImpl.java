package pt.ipcb.kardex.kardex_eletronico.service.shift.issues;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.*;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoPendencia;
import pt.ipcb.kardex.kardex_eletronico.repository.PendenciaRepository;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class IssuesServiceImpl implements IssuesService {

    private static final int VITAL_SIGNS_INTERVAL_HOURS = 24;

    private final Clock clock;

    private final PendenciaRepository repository;

    @Override
    public List<Pendencia> buildIssues(ProcessoClinico process, Turno shift, AtribuicaoUtente atribuicaoUtente){
        var result = new ArrayList<Pendencia>();

        buildMedicationsIssues(atribuicaoUtente, shift, process, result);
        buildVitalSignsIssues(atribuicaoUtente, shift, process, result);
        buildCateterIssues(atribuicaoUtente, shift, process, result);
        buildExamsIssues(atribuicaoUtente, shift, process, result);

        return result;
    }

    private void buildExamsIssues(AtribuicaoUtente assignment, Turno shift, ProcessoClinico process, ArrayList<Pendencia> result){
        process.getExames().forEach(e -> {
            if(e.dataPretendida.equals(shift.getInicio().toLocalDate()) ||
                    e.dataPretendida.equals(shift.getFim().toLocalDate())){

                if(!issueAlreadyExists(shift, TipoPendencia.EXAME, e.getId(), assignment.getUtente())){
                    var issue = new Pendencia();
                    issue.setTipo(TipoPendencia.EXAME);
                    issue.setIdObjeto(e.getId());
                    issue.setDescricao("Exame " + e.tipo + " pendente");
                    issue.setTurno(shift);
                    issue.setUtente(assignment.getUtente());
                    result.add(issue);
                }
            }
        });
    }

    private void buildCateterIssues(AtribuicaoUtente assignment, Turno shift, ProcessoClinico process, ArrayList<Pendencia> result) {
        process.getCateteres().forEach(c -> {
            if (c.getDataSubstituicao().isBefore(LocalDateTime.now(clock))) {

                if(issueAlreadyExists(shift, TipoPendencia.CATETER, c.getId(), assignment.getUtente())){
                    return;
                }

                var issue = new Pendencia();
                issue.setTipo(TipoPendencia.CATETER);
                issue.setIdObjeto(c.getId());
                issue.setDescricao("Substituicao de cateter " + c.getTipo() + " pendente");
                issue.setTurno(shift);
                issue.setUtente(assignment.getUtente());
                result.add(issue);
            }
        });
    }

    private void buildVitalSignsIssues(AtribuicaoUtente assignment, Turno shift, ProcessoClinico process, ArrayList<Pendencia> result) {
        var optLatest = process.getSinaisVitais().stream()
                .max(Comparator.comparing(SinalVital::getData));

        if (optLatest.isEmpty() || optLatest.get().getData()
                .plusHours(VITAL_SIGNS_INTERVAL_HOURS).isBefore(LocalDateTime.now(clock))) {

            if(issueAlreadyExists(shift, TipoPendencia.SINAL_VITAL, null, assignment.getUtente())){
                return;
            }

            var issue = new Pendencia();
            issue.setTipo(TipoPendencia.SINAL_VITAL);
            issue.setDescricao("Registo de sinais vitais pendente");
            issue.setTurno(shift);
            issue.setUtente(assignment.getUtente());
            result.add(issue);
        }
    }

    private void buildMedicationsIssues(AtribuicaoUtente assignment, Turno shift, ProcessoClinico process, ArrayList<Pendencia> result) {
        process.getPrescricoes().forEach(p -> {
            if (p.getUltimaAdministracao() != null || LocalDateTime.now(clock).isAfter(p.getHoraAdministracaoPrevista())) {
                if(!issueAlreadyExists(shift, TipoPendencia.MEDICACAO, p.getId(), assignment.getUtente())){
                    var issue = new Pendencia();
                    issue.setTipo(TipoPendencia.MEDICACAO);
                    issue.setIdObjeto(p.getId());
                    issue.setDescricao("Administracao de " + p.getMedicamento().getNome() + " pendente");
                    issue.setTurno(shift);
                    issue.setUtente(assignment.getUtente());
                    result.add(issue);
                }
            }
        });
    }

    private boolean issueAlreadyExists(Turno shift, TipoPendencia tipo, Long idObjeto, Utente utente) {
        return shift.getPendencias().stream().anyMatch(p ->
                p.getTipo() == tipo &&
                        Objects.equals(p.getIdObjeto(), idObjeto) &&
                        p.getUtente().equals(utente)
        );
    }

    @Transactional
    @Override
    public void executeDefinedIssue(Long objectId, TipoPendencia tipo) {
        var pendencia = repository.findByIdObjetoAndTipo(objectId, tipo)
                .orElseThrow(() -> new KardexException("Pendencia inexistente"));
        resolveIssue(pendencia);
    }

    @Transactional
    @Override
    public void executeUndefinedIssue(Long patientId, TipoPendencia tipo) {
        var pendencia = repository.findByUtenteIdAndTipo(patientId, tipo)
                .orElseThrow(() -> new KardexException("Pendencia inexistente"));
        resolveIssue(pendencia);
    }

    private void resolveIssue(Pendencia pendencia) {
        if (pendencia.isExecutada()) {
            throw new KardexException("Pendencia ja executada");
        }

        var now = LocalDateTime.now(clock);
        if (pendencia.getTurno().getInicio().isAfter(now) || pendencia.getTurno().getFim().isBefore(now)) {
            repository.delete(pendencia);
            return;
        }

        pendencia.setExecutada(true);
    }
}
