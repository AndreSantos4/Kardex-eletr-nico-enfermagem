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
import pt.ipcb.kardex.kardex_eletronico.model.mapper.MedicamentoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.MedicamentoDTO;
import pt.ipcb.kardex.kardex_eletronico.exception.ConflictEntitiesException;
import pt.ipcb.kardex.kardex_eletronico.exception.EntityNotFoundException;
import pt.ipcb.kardex.kardex_eletronico.exception.InactiveResourceException;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService{
    private final Clock clock;

    private final MedicamentoRepository medicamentoRepository;
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
        var medications =  medicamentoRepository.findAll();
		return medicamentoMapper.toDTOList(medications);
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
    
        medication.getDosagens().clear();
        List<Dosagem> novasDosagens = updatedMed.getDosagens();
        Dosagem maxDosagem = updatedMed.getDosagemMaxDiaria();
        
        novasDosagens.forEach(d -> {
            d.setMedicamento(medication);
            medication.getDosagens().add(d);
        });
        
        medication.setDosagemMaxDiaria(maxDosagem);
	}

	@Override
	@Transactional
	public void deactivateMedication(Long medicationId) {
	    var medication = getMedication(medicationId);
            
        medication.setActive(false);

        medicamentoRepository.save(medication);
	}

	@Override
	public void activateMedication(Long medicationId) {
	    var medication = getMedication(medicationId);
            
        medication.setActive(true);

        medicamentoRepository.save(medication);
	}

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
