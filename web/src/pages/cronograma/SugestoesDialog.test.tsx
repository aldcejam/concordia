import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  analisarAtraso,
  aplicarAtraso,
  simularAtraso,
} from '../../api/generated/cronograma/cronograma'
import type { Atraso, Etapa, Simulacao } from '../../api/generated/models'
import { SugestoesDialog } from './SugestoesDialog'

vi.mock('../../api/generated/cronograma/cronograma', () => ({
  analisarAtraso: vi.fn(),
  aplicarAtraso: vi.fn(),
  simularAtraso: vi.fn(),
}))

const etapa = (id: string, ordem: number): Etapa => ({
  id,
  descricao: id,
  ordem,
  status: 'NAO_INICIADA',
  inicio: '2026-10-20T09:00:00-03:00',
  fim: '2026-10-22T09:00:00-03:00',
  duracaoDias: 2,
  inicioOriginal: '2026-10-20T09:00:00-03:00',
  fimOriginal: '2026-10-22T09:00:00-03:00',
  inicioReal: null,
  fimReal: null,
  predecessores: [],
})
const etapas = [etapa('B', 0), etapa('C', 1), etapa('E', 2), etapa('F', 3)]
const atraso: Atraso = {
  aplicadoEm: null,
  autorAplicacao: null,
  id: 'atraso',
  etapaId: 'B',
  motivo: 'Chuva',
  diasAtraso: 3,
  status: 'PRONTO',
  erro: null,
  versaoCronograma: 4,
  criadoEm: '2026-10-12T09:00:00-03:00',
  referencia: '2026-10-12T09:00:00-03:00',
  sugestoes: [
    { etapaId: 'E', justificativa: 'Frente E independente.' },
    { etapaId: 'F', justificativa: 'Frente F independente.' },
  ],
  selecionadas: [],
  resultado: null,
}

function setup(versao = 4, apontamento = atraso) {
  const onApplied = vi.fn().mockResolvedValue(undefined)
  const onAnalyzed = vi.fn()
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <SugestoesDialog
        obraId="obra"
        atraso={apontamento}
        etapas={etapas}
        versao={versao}
        fuso="America/Fortaleza"
        onClose={vi.fn()}
        onAnalyzed={onAnalyzed}
        onApplied={onApplied}
      />
    </QueryClientProvider>,
  )
  return { onApplied, onAnalyzed }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(simularAtraso).mockImplementation(
    async (_obra, _atraso, request) => {
      const ids = [
        'B',
        ...request.etapaIds,
        ...etapas
          .map((e) => e.id)
          .filter((id) => id !== 'B' && !request.etapaIds.includes(id)),
      ]
      const data: Simulacao = {
        antes: { versao: 4, etapas },
        depois: {
          versao: 5,
          etapas: ids.map((id, ordem) => ({
            ...etapas.find((e) => e.id === id)!,
            ordem,
            inicio: request.etapaIds.includes(id)
              ? '2026-10-12T09:00:00-03:00'
              : etapas.find((e) => e.id === id)!.inicio,
          })),
        },
        terminoAntes: etapas[0].fim,
        terminoDepois: etapas[0].fim,
      }
      return { data } as Awaited<ReturnType<typeof simularAtraso>>
    },
  )
  vi.mocked(aplicarAtraso).mockResolvedValue({
    data: { ...atraso, status: 'APLICADO' },
  } as Awaited<ReturnType<typeof aplicarAtraso>>)
})

it('envia somente as selecionadas na ordem ajustada e mostra a prévia antes de aplicar', async () => {
  const user = userEvent.setup()
  const { onApplied } = setup()
  await user.click(screen.getByRole('checkbox', { name: 'Adiantar E' }))
  await user.click(screen.getByRole('checkbox', { name: 'Adiantar F' }))
  await user.click(screen.getByRole('button', { name: 'Mover F para cima' }))
  await waitFor(() =>
    expect(simularAtraso).toHaveBeenLastCalledWith(
      'obra',
      'atraso',
      { etapaIds: ['F', 'E'] },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ),
  )
  const table = screen.getByRole('table', { name: 'Prévia da reprogramação' })
  await waitFor(() =>
    expect(within(table).getAllByRole('row')[2]).toHaveTextContent('F'),
  )
  expect(table).toHaveTextContent('12/10/2026')
  expect(aplicarAtraso).not.toHaveBeenCalled()
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Confirmar sequência e datas' }),
    ).toBeEnabled(),
  )
  await user.click(
    screen.getByRole('button', { name: 'Confirmar sequência e datas' }),
  )
  await waitFor(() =>
    expect(aplicarAtraso).toHaveBeenCalledWith('obra', 'atraso', {
      etapaIds: ['F', 'E'],
    }),
  )
  await waitFor(() => expect(onApplied).toHaveBeenCalledOnce())
})

it('desmarcar uma etapa remove seu ID da simulação', async () => {
  const user = userEvent.setup()
  setup()
  await user.click(screen.getByRole('checkbox', { name: 'Adiantar E' }))
  await user.click(screen.getByRole('checkbox', { name: 'Adiantar F' }))
  await user.click(screen.getByRole('checkbox', { name: 'Adiantar E' }))
  await waitFor(() =>
    expect(simularAtraso).toHaveBeenLastCalledWith(
      'obra',
      'atraso',
      { etapaIds: ['F'] },
      expect.anything(),
    ),
  )
})

it('bloqueia confirmação de uma análise desatualizada', () => {
  setup(5)
  expect(screen.getByText(/O cronograma mudou/)).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Confirmar sequência e datas' }),
  ).toBeDisabled()
  expect(simularAtraso).not.toHaveBeenCalled()
})

it('permite atualizar somente as datas quando não há candidatas', async () => {
  const user = userEvent.setup()
  setup(4, { ...atraso, sugestoes: [] })
  expect(
    screen.getByText(/Não há sugestões de adiantamento/),
  ).toBeInTheDocument()
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Confirmar sequência e datas' }),
    ).toBeEnabled(),
  )
  await user.click(
    screen.getByRole('button', { name: 'Confirmar sequência e datas' }),
  )
  await waitFor(() =>
    expect(aplicarAtraso).toHaveBeenCalledWith('obra', 'atraso', {
      etapaIds: [],
    }),
  )
})

it('uma falha de simulação impede aplicar a seleção', async () => {
  vi.mocked(simularAtraso).mockRejectedValue(new Error('Dependência bloqueada'))
  setup()
  expect(await screen.findByText('Dependência bloqueada')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Confirmar sequência e datas' }),
  ).toBeDisabled()
})

it('permite regenerar sugestões após falha da IA', async () => {
  const user = userEvent.setup()
  vi.mocked(analisarAtraso).mockResolvedValue({ data: atraso } as Awaited<
    ReturnType<typeof analisarAtraso>
  >)
  const { onAnalyzed } = setup(4, {
    ...atraso,
    status: 'FALHOU',
    erro: 'IA indisponível',
    sugestoes: [],
  })
  expect(screen.getByText('IA indisponível')).toBeInTheDocument()
  await user.click(
    screen.getByRole('button', { name: 'Gerar novas sugestões' }),
  )
  await waitFor(() => expect(onAnalyzed).toHaveBeenCalledWith(atraso))
})
