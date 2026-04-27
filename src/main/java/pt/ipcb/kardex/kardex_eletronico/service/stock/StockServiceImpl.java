package pt.ipcb.kardex.kardex_eletronico.service.stock;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Dosagem;
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
	public List<MedicamentoDTO> getAllMedications() {
		return medicamentoMapper.toDTOList(medicamentoRepository.findAll());
	}

	@Override
	@Transactional
	public void editMedication(Long medicationId, CreateMedicationDTO data) {
    	var medication = medicamentoRepository.findById(medicationId)
            .orElseThrow(() -> EntityNotFoundException.forId(medicationId, "Medicamento"));
            
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
        medication.setQuantidade(data.quantidade());
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
	    var medication = medicamentoRepository.findById(medicationId)
            .orElseThrow(() -> EntityNotFoundException.forId(medicationId, "Medicamento"));
            
        medication.setActive(false);
	}

	@Override
	public void activateMedication(Long medicationId) {
	var medication = medicamentoRepository.findById(medicationId)
            .orElseThrow(() -> EntityNotFoundException.forId(medicationId, "Medicamento"));
            
        medication.setActive(true);
	}

	@Override
	public Medicamento getMedication(Long medicationId) {
		return medicamentoRepository.findById(medicationId)
		    .orElseThrow(() -> EntityNotFoundException.forId(medicationId, "Medicamento"));
	}
}
