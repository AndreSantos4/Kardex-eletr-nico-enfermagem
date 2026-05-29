package pt.ipcb.kardex.kardex_eletronico.dto.worker;

public record FuncionarioAtividadeDTO(
        Long id,
        String nome,
        Long administracoes,
        Long intervencoes,
        Long turnos
) {}