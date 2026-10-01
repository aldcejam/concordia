package br.com.concordia.domain.obra;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.obra.dtos.ImportacaoObraInput;
import br.com.concordia.domain.obra.dtos.ImportacaoObraOutput;
import br.com.concordia.domain.obra.dtos.LinhaImportacao;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImportacaoObraService {
    private static final double INTERVALO_POSICAO = 1000.0;

    private final ObraRepository obraRepository;

    public ImportacaoObraService(ObraRepository obraRepository) {
        this.obraRepository = obraRepository;
    }

    @Transactional
    public ImportacaoObraOutput importar(UUID idObra, ImportacaoObraInput input) {
        var obra = obraRepository
                .findById(idObra)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(idObra)));

        if (!obra.getEap().isEmpty()) {
            throw new ConflitoException("A obra com ID %s já possui uma EAP cadastrada.".formatted(idObra));
        }

        Map<String, ItemEap> itensPorNumero = new HashMap<>();
        int posicao = 1;
        for (var linha : input.linhas()) {
            var item = criarItemEap(obra, linha, itensPorNumero, posicao++);
            itensPorNumero.put(linha.item(), item);

            if (!linha.isAgrupamento()) {
                // TODO: vincular o insumo/composição (linha.codigo()) e a quantidade ao orçamento.
                //  Hoje ItemOrcamento pertence a EtapaObra, que exige início e prazo — definir de onde
                //  vêm esses dados (colunas extras no CSV? valores padrão?) e buscar o item por código
                //  (InsumoRepository/ComposicaoRepository ainda não têm findByCodigo).
            }
        }

        obraRepository.save(obra);
        return new ImportacaoObraOutput(obra.getId(), itensPorNumero.size());
    }

    private ItemEap criarItemEap(Obra obra, LinhaImportacao linha, Map<String, ItemEap> itensPorNumero, int posicao) {
        if (itensPorNumero.containsKey(linha.item())) {
            throw new IllegalArgumentException(
                    "Linha %d: item %s está duplicado.".formatted(linha.numeroLinha(), linha.item()));
        }

        ItemEap pai = null;
        var numeroPai = numeroDoPai(linha.item());
        if (numeroPai != null) {
            pai = itensPorNumero.get(numeroPai);
            if (pai == null) {
                throw new IllegalArgumentException("Linha %d: item pai %s do item %s não foi encontrado antes dele."
                        .formatted(linha.numeroLinha(), numeroPai, linha.item()));
            }
        }

        var item = new ItemEap(obra, linha.descricao(), pai, posicao * INTERVALO_POSICAO);
        obra.adicionarItemEap(item);
        return item;
    }

    /** "1.2.3" -> "1.2"; "1" -> null. */
    private static String numeroDoPai(String numero) {
        int ultimoPonto = numero.lastIndexOf('.');
        return ultimoPonto < 0 ? null : numero.substring(0, ultimoPonto);
    }
}
