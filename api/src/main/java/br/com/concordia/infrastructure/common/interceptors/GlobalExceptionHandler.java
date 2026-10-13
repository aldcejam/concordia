package br.com.concordia.infrastructure.common.interceptors;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler({ConflitoException.class, OptimisticLockingFailureException.class})
    public ProblemDetail handleConflict(RuntimeException ex) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Cronograma alterado");
        return problem;
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

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Requisição Inválida");
        return problemDetail;
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleEntityNotFound(EntityNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Recurso Não Encontrado");
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
