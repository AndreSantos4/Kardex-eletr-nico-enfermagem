package pt.ipcb.kardex.kardex_eletronico.controller.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String error;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<T>(true, null, data, null);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<T>(true, message, data, null);
    }

    public static <T> ApiResponse<T> error(String error) {
        return new ApiResponse<T>(false, null, null, error);
    }
}