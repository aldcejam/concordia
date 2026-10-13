# Reprogramação após previsão de atraso

A API permite registrar motivo e dias adicionais para uma etapa. O apontamento é
salvo antes de chamar a IA. A resposta lista IDs e justificativas em ordem de
prioridade. A simulação e a aplicação recebem os IDs na ordem escolhida pelo
usuário; confirmar aplica a sequência e as datas juntas.

O frontend mantém a trilha e o tema da `main`. Clicar no nó circular abre um
popover com dias aproximados e motivo do atraso. Depois da análise, as sugestões
aparecem como ramificações de escolha, sem criar dependências. O usuário seleciona
os nós, ajusta a ordem com as setas e confere a prévia de sequência e datas antes
de confirmar. Alterar a seleção ou a ordem descarta a prévia anterior.

Ao aplicar, a trilha passa a mostrar a sequência de execução da obra inteira,
inclusive etapas antecipadas de outras macroetapas. A ordem vem do cronograma
persistido e permanece após recarregar a página. A EAP conserva seus códigos e
agrupamentos; o botão de visualização permite voltar às macroetapas.

Falhas de análise permitem repetir a chamada usando o apontamento já salvo.
Conflitos ao simular ou confirmar impedem usar a prévia anterior. A tela apresenta
carregamento, erros recuperáveis e ausência de candidatas explicitamente.

A API permite salvar o apontamento de atraso mesmo em etapas que ainda não
possuam planejamento completo de datas. Entretanto, a análise da IA, simulação
e recálculo das datas exigem início, término e duração em todas as etapas da obra.
Enquanto faltar planejamento, o popover explica quantas etapas precisam dele,
permite salvar o registro de atraso e mantém a chamada à IA desabilitada.
Nenhuma data é inventada para a obra importada. As demonstrações com datas de exemplo
ficam no Storybook, e os testes usam respostas de API controladas.

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
  no domínio. O gestor precisa conferir as frentes antes de aplicar;
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

Sem chave, o apontamento fica salvo e a análise retorna uma falha que pode ser
consultada e repetida pela API. Não há substituição por sugestões simuladas. As provas
automatizadas usam uma IA local controlada e um servidor HTTP de teste.

Para desenvolvimento:

```bash
# Terminal 1: configurar também as variáveis DB_URL, DB_USERNAME e DB_PASSWORD.
cd api
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run

# Terminal 2
cd web
npm install
npm run generate:api
npm run dev
```

Com a API em execução, `npm run generate:api` gera os hooks e tipos a partir de
`http://localhost:8080/v3/api-docs`. `OPENAPI_URL` permite usar outro endereço na
geração. Vite encaminha `/api` para `http://localhost:8080`;
`API_PROXY_TARGET` permite mudar o destino sem alterar a interface. O Compose
repassa as três variáveis da IA ao backend e mantém o perfil prod como padrão.
O perfil dev desta branch atualiza o schema sem recriar as tabelas.

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
npm run test:e2e
```

Testes de domínio cobrem propagação transitiva, paralelismo, ordem escolhida,
pré-requisitos, datas reais, reprogramações sucessivas, horário de verão e um
grafo de 5.000 etapas. Integração cobre persistência, histórico, respostas
inválidas, falhas da IA, concorrência e repetição da confirmação. A integração
também cobre os endpoints existentes de cadastro, listagem e medição da EAP,
incluindo etapas sem planejamento. Os testes do frontend cobrem o fluxo de atraso, seleção, edição da ordem, prévia,
confirmação, persistência visual após recarregar, recuperação de falhas e
acessibilidade em tamanhos de celular e tablet. O estilo da trilha segue a `main`.
