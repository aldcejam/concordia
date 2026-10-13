package br.com.concordia.domain.cronograma;

import static br.com.concordia.domain.cronograma.CronogramaDados.*;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.obra.ObraRepository;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.EntityNotFoundException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CronogramaService {
    private final ObraRepository obras;
    private final AtrasoRepository atrasos;
    private final CronogramaSerializer json;
    private final Clock clock;

    public CronogramaService(ObraRepository obras, AtrasoRepository atrasos, CronogramaSerializer json, Clock clock) {
        this.obras = obras;
        this.atrasos = atrasos;
        this.json = json;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Cronograma consultar(UUID obraId) {
        var obra = obra(obraId, false);
        return new Cronograma(
                obraId,
                obra.getDescricao(),
                obra.getFusoHorario().getId(),
                snapshot(obra),
                atrasos.findByObraId(obraId).stream().map(this::resposta).toList());
    }

    @Transactional
    public Etapa criarEtapa(
            UUID obraId, String descricao, OffsetDateTime inicio, int duracao, List<UUID> predecessores) {
        var obra = obra(obraId, true);
        for (var existente : snapshot(obra).etapas()) {
            etapa(obra, existente.id()).reprogramar(existente.ordem(), existente.inicio(), existente.fim());
        }
        var etapa = new EtapaObra(descricao, inicio, duracao, obra.getFusoHorario());
        etapa.definirPredecessores(predecessores(obra, predecessores));
        for (var p : etapa.getPredecessores()) {
            var fim = p.getFimReal() != null ? p.getFimReal() : fim(p);
            if (fim == null) throw new IllegalArgumentException("Cadastre as datas das predecessoras primeiro.");
            if (inicio.isBefore(fim))
                throw new IllegalArgumentException("O início deve respeitar o término das predecessoras.");
        }
        etapa.reprogramar(
                obra.getEtapas().size(),
                inicio,
                inicio.atZoneSameInstant(obra.getFusoHorario())
                        .plusDays(duracao)
                        .toOffsetDateTime());
        obra.getEtapas().add(etapa);
        obra.alterarCronograma();
        var persistida = obras.save(obra);
        obras.flush();
        // Merge pode substituir a instância transitória da etapa por uma cópia gerenciada.
        return dados(persistida.getEtapas().getLast(), etapa.getOrdem());
    }

    @Transactional
    public void alterarDependencias(UUID obraId, UUID etapaId, List<UUID> ids) {
        var obra = obra(obraId, true);
        var etapa = etapa(obra, etapaId);
        if (etapa.getStatus() != StatusEtapa.NAO_INICIADA) {
            throw new IllegalArgumentException("Só é possível alterar dependências de etapas não iniciadas.");
        }
        etapa.definirPredecessores(predecessores(obra, ids));
        MotorCronograma.validarGrafo(snapshot(obra));
        for (var p : etapa.getPredecessores()) {
            var fim = p.getFimReal() != null ? p.getFimReal() : fim(p);
            if (fim == null || etapa.getInicio() == null) {
                throw new IllegalArgumentException("Cadastre as datas das etapas antes de alterar dependências.");
            }
            if (etapa.getInicio().isBefore(fim)) {
                throw new IllegalArgumentException("A dependência conflita com as datas cadastradas.");
            }
        }
        obra.alterarCronograma();
    }

    @Transactional
    public void registrarExecucao(
            UUID obraId, UUID etapaId, StatusEtapa status, OffsetDateTime inicioReal, OffsetDateTime fimReal) {
        var obra = obra(obraId, true);
        var etapa = etapa(obra, etapaId);
        var agora = agora(obra);
        if (inicioReal == null || inicioReal.isAfter(agora) || (fimReal != null && fimReal.isAfter(agora))) {
            throw new IllegalArgumentException("Datas reais devem corresponder a uma execução já ocorrida.");
        }
        for (var p : etapa.getPredecessores()) {
            if (p.getStatus() != StatusEtapa.CONCLUIDA || p.getFimReal().isAfter(inicioReal)) {
                throw new IllegalArgumentException("A execução deve respeitar as predecessoras concluídas.");
            }
        }
        etapa.registrarExecucao(status, inicioReal, fimReal);
        obra.alterarCronograma();
    }

    @Transactional
    public Atraso registrarAtraso(UUID obraId, UUID etapaId, String motivo, int dias) {
        var obra = obra(obraId, true);
        if (etapa(obra, etapaId).getStatus() == StatusEtapa.CONCLUIDA) {
            throw new IllegalArgumentException("Não é possível apontar atraso em uma etapa concluída.");
        }
        if (dias < 1 || dias > 3650 || motivo == null || motivo.isBlank() || motivo.length() > 2000) {
            throw new IllegalArgumentException("Informe motivo e previsão de atraso entre 1 e 3650 dias.");
        }
        obra.alterarCronograma();
        var atraso = new AtrasoEtapa(obraId, etapaId, motivo, dias, obra.getVersaoCronograma(), agora(obra));
        atrasos.save(atraso);
        return resposta(atraso);
    }

    @Transactional
    public Contexto prepararAnalise(UUID obraId, UUID atrasoId) {
        var obra = obra(obraId, true);
        exigirPlanejamento(obra);
        var atraso = atraso(obraId, atrasoId);
        if (atraso.getStatus().equals("APLICADO")) throw new ConflitoException("Este apontamento já foi aplicado.");
        if (atraso.getStatus().equals("ANALISANDO")
                && atraso.getReferencia().plusMinutes(2).isAfter(agora(obra))) {
            throw new ConflitoException("A análise está em andamento. Aguarde antes de tentar novamente.");
        }
        if (etapa(obra, atraso.getEtapaId()).getStatus() == StatusEtapa.CONCLUIDA) {
            throw new ConflitoException("A etapa foi concluída. Este atraso não pode mais ser aplicado.");
        }
        var snapshot = snapshot(obra);
        var referencia = agora(obra);
        var contexto = new Contexto(
                obraId,
                atraso.getEtapaId(),
                atraso.getMotivo(),
                atraso.getDiasAtraso(),
                referencia,
                snapshot,
                MotorCronograma.candidatas(snapshot, atraso.getEtapaId(), referencia));
        atraso.analisar(snapshot.versao(), referencia, json.escrever(contexto));
        return contexto;
    }

    @Transactional
    public Atraso concluirAnalise(
            UUID obraId, UUID atrasoId, Contexto contexto, List<Sugestao> sugestoes, String erro) {
        var obra = obra(obraId, true);
        var atraso = atraso(obraId, atrasoId);
        if (!atraso.getStatus().equals("ANALISANDO")
                || !atraso.getReferencia()
                        .truncatedTo(ChronoUnit.MICROS)
                        .isEqual(contexto.referencia().truncatedTo(ChronoUnit.MICROS))) {
            throw new ConflitoException("Uma análise mais recente substituiu esta resposta.");
        }
        if (obra.getVersaoCronograma() != contexto.cronograma().versao()) {
            atraso.falhar("O cronograma mudou durante a análise. Gere novas sugestões.");
        } else if (erro != null) {
            atraso.falhar(erro);
        } else {
            var vistos = new HashSet<UUID>();
            boolean valido = sugestoes != null
                    && sugestoes.stream()
                            .allMatch(s -> s != null
                                    && s.etapaId() != null
                                    && contexto.candidatasElegiveis().contains(s.etapaId())
                                    && vistos.add(s.etapaId())
                                    && s.justificativa() != null
                                    && !s.justificativa().isBlank()
                                    && s.justificativa().length() <= 2000);
            if (!valido) atraso.falhar("A IA retornou etapas ou justificativas inválidas. Tente novamente.");
            else atraso.recomendar(json.escrever(new Recomendacoes(sugestoes)));
        }
        return resposta(atraso);
    }

    @Transactional(readOnly = true)
    public Simulacao simular(UUID obraId, UUID atrasoId, List<UUID> selecionadas) {
        var obra = obra(obraId, false);
        var atraso = atraso(obraId, atrasoId);
        validarSelecao(obra, atraso, selecionadas);
        return simulacao(obra, atraso, selecionadas);
    }

    @Transactional
    public Atraso aplicar(UUID obraId, UUID atrasoId, List<UUID> selecionadas) {
        return aplicar(obraId, atrasoId, selecionadas, "anonimo");
    }

    @Transactional
    public Atraso aplicar(UUID obraId, UUID atrasoId, List<UUID> selecionadas, String autor) {
        var obra = obra(obraId, true);
        var atraso = atraso(obraId, atrasoId);
        if (atraso.getStatus().equals("APLICADO")) {
            var anteriores =
                    json.ler(atraso.getSelecionadasJson(), Selecao.class).etapaIds();
            if (!anteriores.equals(selecionadas))
                throw new ConflitoException("O apontamento já foi aplicado com outra seleção.");
            return resposta(atraso);
        }
        validarSelecao(obra, atraso, selecionadas);
        var simulacao = simulacao(obra, atraso, selecionadas);
        for (var e : simulacao.depois().etapas()) etapa(obra, e.id()).reprogramar(e.ordem(), e.inicio(), e.fim());
        obra.alterarCronograma();
        atraso.aplicar(json.escrever(new Selecao(selecionadas)), json.escrever(simulacao), agora(obra), autor);
        return resposta(atraso);
    }

    private void validarSelecao(Obra obra, AtrasoEtapa atraso, List<UUID> selecionadas) {
        if (!atraso.getStatus().equals("PRONTO"))
            throw new ConflitoException("Gere uma análise válida antes de simular.");
        if (obra.getVersaoCronograma() != atraso.getVersaoCronograma()) {
            throw new ConflitoException("O cronograma foi alterado. Gere novas sugestões antes de confirmar.");
        }
        if (atraso.getReferencia().plusDays(1).isBefore(agora(obra))
                || atraso.getReferencia()
                        .atZoneSameInstant(obra.getFusoHorario())
                        .toLocalDate()
                        .isBefore(agora(obra).toLocalDate())) {
            throw new ConflitoException("A análise expirou. Gere novas sugestões com datas atualizadas.");
        }
        var recomendadas = json.ler(atraso.getSugestoesJson(), Recomendacoes.class).sugestoes().stream()
                .map(Sugestao::etapaId)
                .toList();
        if (selecionadas == null || !recomendadas.containsAll(selecionadas)) {
            throw new IllegalArgumentException("Selecione apenas etapas recomendadas nesta análise.");
        }
    }

    private Simulacao simulacao(Obra obra, AtrasoEtapa atraso, List<UUID> selecionadas) {
        return MotorCronograma.simular(
                snapshot(obra),
                atraso.getEtapaId(),
                atraso.getDiasAtraso(),
                atraso.getReferencia(),
                selecionadas,
                obra.getFusoHorario());
    }

    private Atraso resposta(AtrasoEtapa a) {
        return new Atraso(
                a.getId(),
                a.getEtapaId(),
                a.getMotivo(),
                a.getDiasAtraso(),
                a.getStatus(),
                a.getErro(),
                a.getVersaoCronograma(),
                a.getCriadoEm(),
                a.getReferencia(),
                a.getSugestoesJson() == null
                        ? List.of()
                        : json.ler(a.getSugestoesJson(), Recomendacoes.class).sugestoes(),
                a.getSelecionadasJson() == null
                        ? List.of()
                        : json.ler(a.getSelecionadasJson(), Selecao.class).etapaIds(),
                a.getResultadoJson() == null ? null : json.ler(a.getResultadoJson(), Simulacao.class),
                a.getAplicadoEm(),
                a.getAutorAplicacao());
    }

    private Snapshot snapshot(Obra obra) {
        var etapas = new ArrayList<>(obra.getEtapas());
        // Para etapas antigas sem ordem, UUID v7 fornece uma ordem inicial determinística.
        etapas.sort(Comparator.comparing(EtapaObra::getOrdem, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(EtapaObra::getId));
        var dados = new ArrayList<Etapa>();
        for (int i = 0; i < etapas.size(); i++) dados.add(dados(etapas.get(i), i));
        return new Snapshot(obra.getVersaoCronograma(), List.copyOf(dados));
    }

    private Etapa dados(EtapaObra e, int ordem) {
        return new Etapa(
                e.getId(),
                e.getDescricao(),
                ordem,
                e.getStatus(),
                e.getInicio(),
                fim(e),
                e.getPrazoEsperadoDias(),
                e.getInicioOriginal() == null ? e.getInicio() : e.getInicioOriginal(),
                e.getFimOriginal() == null ? fim(e) : e.getFimOriginal(),
                e.getInicioReal(),
                e.getFimReal(),
                e.getPredecessores().stream().map(EtapaObra::getId).toList());
    }

    private OffsetDateTime fim(EtapaObra e) {
        if (e.getFim() != null) return e.getFim();
        return e.getInicio() == null || e.getPrazoEsperadoDias() == null
                ? null
                : e.getInicio().plusDays(e.getPrazoEsperadoDias());
    }

    private void exigirPlanejamento(Obra obra) {
        if (obra.getEtapas().stream()
                .anyMatch(e -> e.getInicio() == null
                        || fim(e) == null
                        || e.getPrazoEsperadoDias() == null
                        || e.getPrazoEsperadoDias() < 1)) {
            throw new IllegalArgumentException("Todas as etapas precisam de datas e duração para reprogramar a obra.");
        }
    }

    private OffsetDateTime agora(Obra obra) {
        return OffsetDateTime.now(clock.withZone(obra.getFusoHorario())).truncatedTo(ChronoUnit.MICROS);
    }

    private Obra obra(UUID id, boolean lock) {
        return (lock ? obras.findByIdForUpdate(id) : obras.findById(id))
                .orElseThrow(() -> new EntityNotFoundException("Obra não encontrada."));
    }

    private EtapaObra etapa(Obra obra, UUID id) {
        return obra.getEtapas().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Etapa não encontrada nesta obra."));
    }

    private List<EtapaObra> predecessores(Obra obra, List<UUID> ids) {
        if (ids == null || new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Informe uma lista de dependências sem duplicatas.");
        }
        return ids.stream().map(id -> etapa(obra, id)).toList();
    }

    private AtrasoEtapa atraso(UUID obraId, UUID id) {
        return atrasos.findById(id)
                .filter(a -> a.getObraId().equals(obraId))
                .orElseThrow(() -> new EntityNotFoundException("Apontamento não encontrado nesta obra."));
    }
}
