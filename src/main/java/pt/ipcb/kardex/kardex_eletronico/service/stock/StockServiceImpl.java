package pt.ipcb.kardex.kardex_eletronico.service.stock;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.StockChangeDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.KardexException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Dosagem;
import pt.ipcb.kardex.kardex_eletronico.model.entity.LoteMedicamento;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Medicamento;
import pt.ipcb.kardex.kardex_eletronico.model.enumerated.UnidadeMedida;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.MedicamentoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.ContencaoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;
import pt.ipcb.kardex.kardex_eletronico.repository.PrescricaoRepository;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.InactiveResourceException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService{
    private final Clock clock;

    private final MedicamentoRepository medicamentoRepository;
    private final PrescricaoRepository prescricaoRepository;
    private final ContencaoRepository contencaoRepository;
    private final MedicamentoMapper medicamentoMapper;

    @Override
    @Transactional
    public void addMedication(CreateMedicationDTO data) {
        medicamentoRepository
            .findByNomeAndPrincipioAtivoAndFormaFarmaceuticaAndViaAdministracao(
                data.nome(),
                data.principioAtivo(),
                data.formaFarmaceutica(),
                data.viaAdministracao()
            )
            .ifPresent(m -> { throw new ConflictEntitiesException("Este medicamento ja se encontra registado"); });
        
        var newMed = medicamentoMapper.fromCreate(data);
        List<Dosagem> dosagens = new ArrayList<>(newMed.getDosagens());
        Dosagem maxDose = newMed.getDosagemMaxDiaria();
        newMed.setDosagens(new ArrayList<>());
        newMed.setDosagemMaxDiaria(null);
        newMed.getDosagens().forEach(d -> d.setMedicamento(newMed));
        var saved = medicamentoRepository.save(newMed);
            
        dosagens.forEach(d -> {
            d.setMedicamento(saved);
            saved.getDosagens().add(d);
        });
        saved.setDosagemMaxDiaria(maxDose);

        medicamentoRepository.save(newMed);
    }

    @Override
    @Transactional(readOnly = true)
    public long getMedicationsCount() {
        return medicamentoRepository.countUniqueMedications();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicamentoDTO> getAllMedications() {
        return medicamentoRepository.findAll()
                .stream()
                .map(m -> {
                    BigDecimal quantidade = m.getLotes().stream()
                            .filter(lote -> !lote.getValidade().isBefore(LocalDate.now(clock)))
                            .map(LoteMedicamento::getQuantidade)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return medicamentoMapper.toDTO(m, quantidade);
                })
                .toList();
    }

	@Override
	@Transactional
	public void editMedication(Long medicationId, CreateMedicationDTO data) {
    	var medication = getMedication(medicationId);

        if(!medication.isActive()){
            throw new InactiveResourceException("Medicamento");
        }

        var updatedMed = medicamentoMapper.fromCreate(data);

        medication.setNome(data.nome());
        medication.setPrincipioAtivo(data.principioAtivo());
        medication.setFormaFarmaceutica(data.formaFarmaceutica());
        medication.setClasseFarmacologica(data.classeFarmacologica());
        medication.setViaAdministracao(data.viaAdministracao());
        medication.setUnidadeMedida(data.unidadeMedida());
        medication.setAltoRisco(data.altoRisco());

        reconciliarDosagens(medication, updatedMed.getDosagens(), updatedMed.getDosagemMaxDiaria());
	}

    private void reconciliarDosagens(Medicamento medication, List<Dosagem> novasDosagens, Dosagem novaMaxDosagem) {
        Map<String, Dosagem> existentesPorChave = new HashMap<>();
        for (Dosagem d : medication.getDosagens()) {
            existentesPorChave.put(chaveDosagem(d.getDose(), d.getUnidadeMedida()), d);
        }

        Set<Dosagem> aManter = new HashSet<>();
        for (Dosagem nova : novasDosagens) {
            String chave = chaveDosagem(nova.getDose(), nova.getUnidadeMedida());
            Dosagem existente = existentesPorChave.get(chave);
            if (existente != null) {
                aManter.add(existente);
            } else {
                nova.setMedicamento(medication);
                medication.getDosagens().add(nova);
                aManter.add(nova);
            }
        }

        Iterator<Dosagem> it = medication.getDosagens().iterator();
        while (it.hasNext()) {
            Dosagem d = it.next();
            if (aManter.contains(d)) continue;

            if (d.getId() != null && estaReferenciada(d.getId())) {
                continue;
            }
            it.remove();
        }

        Dosagem maxReusada = novaMaxDosagem == null
            ? null
            : existentesPorChave.get(chaveDosagem(novaMaxDosagem.getDose(), novaMaxDosagem.getUnidadeMedida()));
        medication.setDosagemMaxDiaria(maxReusada != null ? maxReusada : novaMaxDosagem);
    }

    private boolean estaReferenciada(Long doseId) {
        return prescricaoRepository.existsByDose_Id(doseId)
            || contencaoRepository.existsByDose_Id(doseId);
    }

    private static String chaveDosagem(java.math.BigDecimal dose, UnidadeMedida unidade) {
        String doseKey = dose == null ? "null" : dose.stripTrailingZeros().toPlainString();
        return doseKey + "|" + (unidade == null ? "null" : unidade.name());
    }

	@Override
	@Transactional
	public void deactivateMedication(Long medicationId) {
	    var medication = getMedication(medicationId);
            
        medication.setActive(false);

        medicamentoRepository.save(medication);
	}

    @Transactional
	@Override
	public void activateMedication(Long medicationId) {
	    var medication = getMedication(medicationId);
            
        medication.setActive(true);

        medicamentoRepository.save(medication);
	}

    @Transactional(readOnly = true)
	@Override
	public Medicamento getMedication(Long medicationId) {
		return medicamentoRepository.findById(medicationId)
		    .orElseThrow(() -> EntityNotFoundException.forId(medicationId, "Medicamento"));
	}

    @Override
    @Transactional
    public void recordStockChange(Long medicationId, StockChangeDTO data) {
        var medication = getMedication(medicationId);

        if(!medication.isActive()){
            throw new InactiveResourceException("Medicamento");
        }

        if (data.quantidade().compareTo(BigDecimal.ZERO) <= 0) {
            throw new KardexException("A quantidade deve ser superior a zero");
        }

        var batch = new LoteMedicamento();
        batch.setMedicamento(medication);
        batch.setQuantidade(data.quantidade());

        medication.getLotes().add(batch);
    }

    @Transactional
    @Override
    public void subtractFromStock(Medicamento medication, BigDecimal quantidade) {
        for (LoteMedicamento lote : medication.getLotes()) {
            if (quantidade.compareTo(BigDecimal.ZERO) <= 0) break;
            if (lote.getValidade().isBefore(LocalDate.now(clock))) continue;

            if (quantidade.compareTo(lote.getQuantidade()) >= 0) {
                quantidade = quantidade.subtract(lote.getQuantidade());
                lote.setQuantidade(BigDecimal.ZERO);
            } else {
                lote.setQuantidade(lote.getQuantidade().subtract(quantidade));
                quantidade = BigDecimal.ZERO;
            }
        }

        if (quantidade.compareTo(BigDecimal.ZERO) > 0) {
            throw new KardexException("Stock insuficiente para o medicamento: " + medication.getNome());
        }
    }
}
