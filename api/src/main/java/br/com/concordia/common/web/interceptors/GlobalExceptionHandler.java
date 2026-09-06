package br.com.concordia.common.web.interceptors;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ProblemDetail handleRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Recurso Não Encontrado");
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Um ou mais campos do corpo da requisição são inválidos.");

        problemDetail.setTitle("Erro de Validação de Dados");
        problemDetail.setProperty("timestamp", Instant.now());

        List<Map<String, String>> erros = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> Map.of(
                        "campo",
                        fieldError.getField(),
                        "mensagem",
                        fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Valor inválido"))
                .toList();

        problemDetail.setProperty("invalidFields", erros);

        return problemDetail;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String mensagemDetalhada = "O corpo da requisição é inválido ou contém tipos de dados incompatíveis.";

        if (ex.getCause() != null && ex.getCause().getMessage() != null) {
            mensagemDetalhada = ex.getMessage();
        }

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, mensagemDetalhada);

        problemDetail.setTitle("Corpo da Requisição Inválido");
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }
}
