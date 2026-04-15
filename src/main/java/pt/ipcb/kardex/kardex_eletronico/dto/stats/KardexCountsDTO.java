package pt.ipcb.kardex.kardex_eletronico.dto.stats;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KardexCountsDTO(
    @JsonProperty("activeUsers") Long activeUsers,
    @JsonProperty("hospitalizedPatients") Long hospitalizedPatients,
    @JsonProperty("openSessions") Long openSessions,
    @JsonProperty("medicationsCatalog") Long medicationsCatalog,
    @JsonProperty("activeNurses") Long activeNurses,
    @JsonProperty("acceptedPatientsToday") Long acceptedPatientsToday,
    @JsonProperty("dischargedPatientsToday") Long dischargedPatientsToday
) {
    public static KardexCountsDTO forChiefNurse(long hospitalizedPatients, long activeNurses, long acceptedPatientsToday, long dischargedPatientsToday){
        return new KardexCountsDTO(
            null, 
            hospitalizedPatients, 
            null, 
            null, 
            activeNurses, 
            acceptedPatientsToday, 
            dischargedPatientsToday
        );
    }
    
    public static KardexCountsDTO forMedic(long hospitalizedPatients){
        return new KardexCountsDTO(
            null, 
            hospitalizedPatients, 
            null, 
            null, 
            null, 
            null, 
            null
        );
    }

    public static KardexCountsDTO forAdmin(long activeUsers, long hospitalizedPatients, long openSessions, long medicationsCatalog){
        return new KardexCountsDTO(
            activeUsers, 
            hospitalizedPatients, 
            openSessions, 
            medicationsCatalog, 
            null, 
            null, 
            null
        );
    }
}
