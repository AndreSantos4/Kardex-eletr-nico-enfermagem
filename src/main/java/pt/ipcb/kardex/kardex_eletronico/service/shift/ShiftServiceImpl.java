package pt.ipcb.kardex.kardex_eletronico.service.shift;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.dto.shift.CreateShiftDTO;
import pt.ipcb.kardex.kardex_eletronico.model.mapper.TurnoMapper;
import pt.ipcb.kardex.kardex_eletronico.repository.TurnoRepository;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService{

    private final TurnoRepository repository;
    private final TurnoMapper mapper;

    @Override
    public void CreateShift(CreateShiftDTO data) {
        var shift = mapper.fromCreate(data);
        repository.save(shift);
    }
}
