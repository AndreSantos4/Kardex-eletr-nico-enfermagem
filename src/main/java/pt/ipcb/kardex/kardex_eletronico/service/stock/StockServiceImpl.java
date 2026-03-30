package pt.ipcb.kardex.kardex_eletronico.service.stock;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.stock.CreateMedicationDTO;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.MedicamentoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.MedicamentoRepository;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService{

    private final MedicamentoRepository medicamentoRepository;
    private final MedicamentoMapper medicamentoMapper;

    @Override
    @Transactional
    public void addMedication(CreateMedicationDTO data) {
        var existingMedication = medicamentoRepository.findByNome(data.nome(), data.unidade());
        
        if(existingMedication.isPresent()){
            existingMedication.get().quantidade += data.quantidade();
            medicamentoRepository.save(existingMedication.get());
        }
        else{
            var medication = medicamentoMapper.fromCreate(data);
            medicamentoRepository.save(medication);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getMedicationsCount() {
        return medicamentoRepository.countUniqueMedications();
    }

}
