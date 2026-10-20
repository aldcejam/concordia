package br.com.concordia.domain.obra.importacao;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

/** Dados da obra informados pelo usuário no momento da importação. {@code descricao} nula usa o nome da planilha. */
public record DadosObraImportacao(String descricao, UnidadeFederativa uf, ZoneId fusoHorario, UUID idEmpresa) {}
