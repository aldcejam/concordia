# Reprogramação após previsão de atraso

O usuário informa motivo e dias adicionais para uma etapa. O apontamento é salvo
antes de chamar a IA. A resposta lista IDs e justificativas em ordem de prioridade.
O usuário seleciona candidatas e usa as setas para mudar essa ordem. Cada alteração
solicita uma simulação ao backend. Confirmar aplica a sequência e as datas juntas.

## Regras implementadas

- A sequência de execução é própria de `EtapaObra.ordem`; não altera a EAP.
- A IA recebe todas as etapas, datas, estado, datas reais e dependências, além do
  motivo do atraso e uma lista de IDs elegíveis. Não cria nem sugere dependências.
- Elegíveis: etapas posteriores à afetada, não iniciadas, com início previsto
  posterior à referência da análise e com todas as predecessoras já concluídas.
- Somente IDs recomendados na análise podem ser selecionados. IDs inexistentes,
  etapas de outra obra, duplicatas e justificativas vazias invalidam a resposta.
- Selecionadas são removidas de suas posições e inseridas como um bloco logo após
  a afetada, na ordem escolhida. As demais preservam a ordem relativa.
- O calendário usa dias corridos e o fuso da obra. Dependências existentes são
  interpretadas como fim-início. Etapas independentes podem começar em paralelo.
  A ordem visual indica prioridade e não cria uma relação de precedência.
- Antecipadas começam na referência da análise, respeitando os pré-requisitos.
  Etapas não iniciadas com previsão já vencida são trazidas para essa referência.
  A etapa afetada recebe os dias adicionais no término previsto. O cálculo
  propaga mudanças às sucessoras, preservando extensões anteriores de duração.
- Planejamento original e datas reais são preservados. Etapas concluídas não
  recebem alterações de datas. Uma análise sem candidatas permite aplicar apenas
  o impacto do atraso às datas.
- Materiais, equipes, feriados e limites de capacidade ainda não possuem cadastro
  no domínio. A tela pede ao gestor confirmar as frentes antes de aplicar;
  o sistema não calcula alocação de recursos, Curva S nem folgas CPM neste fluxo.
- Simulação não grava datas. Aplicação usa lock da obra e versão do cronograma;
  mudanças em etapas, execução, dependências ou dados da obra invalidam a análise.
  Repetir uma confirmação com a mesma seleção retorna o resultado anterior.
- O histórico guarda contexto da análise, sugestões, seleção e cronogramas
  anterior e posterior, data da confirmação e usuário autenticado quando houver
  um `Principal`. Na configuração atual sem login, registra `anonimo`.
  Análises expiram após 24 horas ou na mudança de dia no
  fuso da obra. Uma chamada travada pode
  ser refeita após dois minutos. O timeout HTTP da IA é de 45 segundos.

## Configuração

No backend, configurar `OPENAI_API_KEY`. `OPENAI_MODEL` tem padrão `gpt-4o-mini` e
`OPENAI_BASE_URL` tem padrão `https://api.openai.com/v1`. A URL deve apontar para
uma API compatível com `POST /chat/completions`, mensagens e
`response_format: json_schema` com `strict: true`. A chave nunca vai ao frontend.

Sem chave, o apontamento fica salvo e a análise mostra erro com opção de tentar
novamente. Não há substituição silenciosa por sugestões simuladas. As provas
automatizadas usam uma IA local controlada e um servidor HTTP de teste.

Para desenvolvimento:

```bash
# Terminal 1: configurar também as variáveis DB_URL, DB_USERNAME e DB_PASSWORD.
cd api
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run

# Terminal 2
cd web
npm install
npm run dev
```

O frontend gera o cliente Orval antes de dev, build e testes. Vite encaminha
`/api` para `http://localhost:8080`; `API_PROXY_TARGET` permite mudar esse endereço.
O Nginx do Compose encaminha `/api` ao serviço `api`. O Compose repassa as três
variáveis da IA ao backend e usa o perfil dev por padrão para o banco local.

Em banco existente com perfil prod, aplicar previamente
`api/src/main/resources/db/manual/20261012_cronograma.sql`. O projeto ainda não
possui um mecanismo automático de migrations; o script é uma atualização do
schema existente, não a criação inicial de todas as entidades.

## Endpoints

Todos os caminhos abaixo têm prefixo `/api/obras/{obraId}/cronograma`.

| Método | Caminho | Uso |
|---|---|---|
| GET | `/` | Etapas na sequência atual e histórico |
| POST | `/etapas` | Cadastro de etapa e predecessoras |
| PUT | `/etapas/{etapaId}/dependencias` | Editar dependências cadastradas; rejeita ciclos |
| PATCH | `/etapas/{etapaId}/execucao` | Registrar início real e conclusão |
| POST | `/atrasos` | Salvar previsão de atraso |
| POST | `/atrasos/{atrasoId}/analise` | Analisar ou tentar novamente |
| POST | `/atrasos/{atrasoId}/simulacao` | Prévia; recebe `etapaIds` na ordem escolhida |
| POST | `/atrasos/{atrasoId}/aplicacao` | Confirmar; recebe a mesma seleção ordenada |

## Verificação

```bash
cd api
mvn test
mvn spotless:check

cd ../web
npm test
npm run build
npm run lint
npm run format:check
```

Testes de domínio cobrem propagação transitiva, paralelismo, ordem escolhida,
pré-requisitos, datas reais, reprogramações sucessivas, horário de verão e um
grafo de 5.000 etapas. Integração cobre persistência, histórico, respostas
inválidas, falhas da IA, concorrência e repetição da confirmação. A interface
verifica seleção, reordenação, simulação e bloqueio de análises desatualizadas.
