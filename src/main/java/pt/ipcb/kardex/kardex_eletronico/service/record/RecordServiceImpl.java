package pt.ipcb.kardex.kardex_eletronico.service.record;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.process.ProcessoClinicoDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Registo;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.NivelRegisto;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.TipoRegisto;
import pt.ipcb.kardex.kardex_eletronico.repository.RegistoRepository;

@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final RegistoRepository repository;

    @Override
    @Transactional
    public void recordPatientAcceptance(ProcessoClinicoDTO process, boolean newProcess) {
        var user = (Utilizador) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        var details = newProcess ? "E o primeiro processo associado ao cliente" : "O utente ja possuia um ou mais processos a ele associado";

        var record = new Registo(
            null, 
            user,
            NivelRegisto.INFO,
            TipoRegisto.PATIENT_ACCEPTANCE, 
            "processo_clinico&utente", 
            String.format("O processo clinico numero %d foi aberto para o utente de id %d", process.id(), process.utenteId()), 
            details, 
            LocalDateTime.now()
        );

        repository.save(record);
    }

    @Override
    @Transactional
    public void recordPatientDischarge(ProcessoClinicoDTO process) {
        var user = (Utilizador) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
                
        var record = new Registo(
            null, 
            user, 
            NivelRegisto.INFO, 
            TipoRegisto.PATIENT_DISCHARGE, 
            "processo_clinico&utente", 
            String.format("O processo clinico numero %d foi finalizado, e o utente de id %d foi liberado", process.id(), process.utenteId()), 
            null,
            LocalDateTime.now()
        );

        repository.save(record);
    }

    @Override
    @Transactional
    public void recordUserRegistration(Utilizador newUser, boolean isWorker) {
        var originTable = isWorker ? "utilizador&funcionario" : "utilizador";
        var record = new Registo(
            null, 
            newUser, 
            NivelRegisto.INFO, 
            TipoRegisto.USER_CREATION, 
            originTable, 
            String.format("O utilizador de id %d foi registado", newUser.getId()), 
            null,
            LocalDateTime.now()
        );

        if(isWorker){
            record.setDetalhes("E foi criado um funcionario a ele associado");
        }

        repository.save(record);
    }

    @Override
    @Transactional
    public void recordUserLogout(Utilizador user) {
        var record = new Registo(
            null, 
            user, 
            NivelRegisto.INFO, 
            TipoRegisto.AUTH, 
            "sessao", 
            String.format("O utilizador de id %d efetuou logout", user.getId()), 
            null,
            LocalDateTime.now()
        );

        repository.save(record);
    }

    @Override
    @Transactional
    public void recordUserLogin(Utilizador user) {
        var record = new Registo(
            null, 
            user, 
            NivelRegisto.INFO, 
            TipoRegisto.AUTH, 
            "sessao", 
            String.format("O utilizador de id %d efetuou login", user.getId()), 
            null,
            LocalDateTime.now()
        );

        repository.save(record);
    }

    @Override
    @Transactional
    public void recordLoginAttempt(Long numeroMecanografico, String ip, boolean sucess) {
        var details = sucess ? "Tentativa bem sucedida" : "Tentativa mal sucedida";
        var record = new Registo(
            null, 
            null, 
            NivelRegisto.ALERTA, 
            TipoRegisto.AUTH, 
            "tentativa_login", 
            String.format("Uma tentativa de login para o numero mecanografico %d foi efetuada pelo ip %s", numeroMecanografico, ip), 
            details,
            LocalDateTime.now()
        );

        repository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public long getAcceptedPatientsCountToday() {
        var startOfDay = LocalDate.now().atStartOfDay();
        return repository.countByTipoRegistoAndStampAfter(TipoRegisto.PATIENT_ACCEPTANCE, startOfDay);
    }

    @Override
    @Transactional(readOnly = true)
    public long getDischargedPatientsCountToday() {
        var startOfDay = LocalDate.now().atStartOfDay();
        return repository.countByTipoRegistoAndStampAfter(TipoRegisto.PATIENT_DISCHARGE, startOfDay);
    }

    @Override
    public void recordPasswordResetRequest(Utilizador user) {
        var record = new Registo(
            null, 
            user, 
            NivelRegisto.INFO, 
            TipoRegisto.AUTH, 
            "tentativa_login", 
            String.format("Foi efetuado um pedido de reset de password para o utilizador de id %d", user.getId()), 
            null,
            LocalDateTime.now()
        );

        repository.save(record);
    }
}
