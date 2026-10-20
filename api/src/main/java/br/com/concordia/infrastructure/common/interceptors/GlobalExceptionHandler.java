package br.com.concordia.infrastructure.common.interceptors;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.obra.importacao.PlanilhaInvalidaException;
import br.com.concordia.infrastructure.obra.dtos.ErroImportacaoResponse;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

@RestControllerAdvice
public class GlobalExceptionHandler {
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

    @ExceptionHandler(ConflitoException.class)
    public ProblemDetail handleConflito(ConflitoException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problemDetail.setTitle("Conflito");
        return problemDetail;
    }

    @ExceptionHandler(PlanilhaInvalidaException.class)
    public ProblemDetail handlePlanilhaInvalida(PlanilhaInvalidaException ex) {
        ProblemDetail problemDetail =
                ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage());
        problemDetail.setTitle("Planilha Inválida");
        problemDetail.setProperty(
                "erros",
                ex.getErros().stream().map(ErroImportacaoResponse::from).toList());
        return problemDetail;
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ProblemDetail handleMissingPart(MissingServletRequestPartException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "O campo '%s' é obrigatório.".formatted(ex.getRequestPartName()));
        problemDetail.setTitle("Requisição Inválida");
        return problemDetail;
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONTENT_TOO_LARGE, "O arquivo excede o tamanho máximo permitido de 20 MB.");
        problemDetail.setTitle("Arquivo Muito Grande");
        return problemDetail;
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleMissingParameter(MissingServletRequestParameterException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "O campo '%s' é obrigatório.".formatted(ex.getParameterName()));
        problemDetail.setTitle("Requisição Inválida");
        return problemDetail;
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Valor inválido para o campo '%s': %s".formatted(ex.getName(), ex.getValue()));
        problemDetail.setTitle("Requisição Inválida");
        return problemDetail;
    }
}
