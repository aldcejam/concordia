package br.com.concordia.features.obras.importarobrascsv;

import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraRequest;
import br.com.concordia.features.obras.common.ObraResponse;
import com.opencsv.CSVReader;
import jakarta.persistence.EntityNotFoundException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImportarObrasCsvService {

    private final ImportarObrasCsvRepository obraRepository;
    private final ImportarObrasCsvEmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public ImportarObrasCsvService(
            ImportarObrasCsvRepository obraRepository,
            ImportarObrasCsvEmpresaRepository empresaRepository,
            ObraMapper mapper) {
        this.obraRepository = obraRepository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
    }

    public ImportacaoObrasResponse importar(MultipartFile arquivo) {
        List<ObraResponse> importadas = new ArrayList<>();
        List<ImportacaoErro> erros = new ArrayList<>();

        List<String[]> linhas = lerLinhas(arquivo);

        for (int i = 1; i < linhas.size(); i++) {
            int numeroLinha = i + 1;
            try {
                ObraRequest request = mapearLinha(linhas.get(i));
                importadas.add(criarObra(request));
            } catch (Exception e) {
                erros.add(new ImportacaoErro(numeroLinha, e.getMessage()));
            }
        }

        return new ImportacaoObrasResponse(importadas, erros);
    }

    @Transactional
    public ObraResponse criarObra(ObraRequest request) {
        Empresa empresa = null;
        if (request.idEmpresa() != null) {
            empresa = empresaRepository
                    .findById(request.idEmpresa())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.idEmpresa())));
        }
        var obra = mapper.toEntity(request, empresa);
        return mapper.toResponseDto(obraRepository.save(obra));
    }

    private List<String[]> lerLinhas(MultipartFile arquivo) {
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(arquivo.getInputStream(), StandardCharsets.UTF_8))) {
            return reader.readAll();
        } catch (Exception e) {
            throw new ImportacaoCsvException("Falha ao processar o arquivo CSV", e);
        }
    }

    private ObraRequest mapearLinha(String[] linha) {
        return new ObraRequest(
                linha[0],                                  // nome, por ex.
                linha[1],                                  // endereco, por ex.
                linha[2] == null || linha[2].isBlank() ? null : Long.valueOf(linha[2]) // idEmpresa
        );
    }
}