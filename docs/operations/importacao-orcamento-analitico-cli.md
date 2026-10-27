# Runbook: Importação de Orçamento Analítico via Script CLI

| Campo | Valor |
| --- | --- |
| **Serviço / Componente** | Script Utilitário `api/scripts/importar-orcamento-xlsx.py` |
| **Criticidade** | `Baixa` (Ferramenta de Automação / Carga de Dados via API REST) |
| **Última Verificação** | `2026-04-19` |

## Quando Usar (Sintomas / Gatilhos)

- Quando desejar criar ou sincronizar pela linha de comando a obra de demonstração e suas composições a partir de uma planilha analítica `.xlsx` (como `docs/orcamento_analitico.xlsx`) consumindo os endpoints `/api/obras`, `/api/obras/{id}/etapas` e `/api/obras/{id}/etapas/{etapaId}/orcamento` ([UC-OBR-007](../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md)).

> [!NOTE]
> Para o fluxo padrão do produto (que inclui pré-visualização, validação detalhada por linha/coluna e criação atômica da árvore completa da EAP `ItemEap` e `EtapaObra` em uma única requisição), utilize a tela de importação (`/obras/nova`) ou o endpoint `POST /api/obras/importacoes` documentado em [UC-OBR-001](../use-cases/obra/UC-OBR-001-importar-planilha-orcamentaria/README.md).

## Pré-requisitos

- Python 3.10+ instalado.
- Backend Concordia em execução (`http://localhost:8080`).
- Planilha `.xlsx` no formato analítico SINAPI/EAP (ex.: `docs/orcamento_analitico.xlsx`).

## Diagnóstico

Verifique os argumentos suportados pelo script e confirme que a API está acessível:

```bash
python3 api/scripts/importar-orcamento-xlsx.py --help
curl -i http://localhost:8080/api/obras
```

## Procedimento Passo a Passo

1. Com o backend rodando em `http://localhost:8080`, execute o script informando o caminho da planilha analítica:
   ```bash
   python3 api/scripts/importar-orcamento-xlsx.py docs/orcamento_analitico.xlsx --api http://localhost:8080
   ```
2. O script localiza a obra pela descrição padrão (ou cria uma nova via `POST /api/obras`) e percorre todas as composições da planilha:
   - Se já existir etapa com o mesmo `codigoEap` na obra, atualiza seus dados orçamentários via `PATCH /api/obras/{id}/etapas/{etapaId}/orcamento`.
   - Caso contrário, cria a etapa via `POST /api/obras/{id}/etapas`.
3. Ao final, o terminal exibe `Importação concluída. Obra <UUID>: <N> composições sincronizadas; <N> no total.`.

## Rollback / Mitigação

Caso deseje remover a obra criada ou sincronizada pelo script, execute `DELETE /api/obras/{id}` informando o UUID impresso no final da execução:

```bash
curl -X DELETE http://localhost:8080/api/obras/<OBRA_ID>
```
