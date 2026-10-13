import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { HomePage } from './HomePage'
import { theme } from '../theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getObras } from '../api/generated/obras/obras'

vi.mock('../api/generated/obras/obras', () => ({
  getObras: vi.fn(),
  createObra: vi.fn(),
}))

describe('HomePage', () => {
  it('apresenta o nome do projeto e o acesso ao cronograma', async () => {
    vi.mocked(getObras).mockResolvedValue({
      data: [
        {
          id: 'obra',
          descricao: 'Escola',
          uf: 'RN',
          fusoHorario: 'America/Fortaleza',
          status: 'EM_PLANEJAMENTO',
          id_empresa: null,
        },
      ],
    } as Awaited<ReturnType<typeof getObras>>)
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <ThemeProvider theme={theme}>
          <HomePage />
        </ThemeProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByText('CONCORDIA')).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Abrir cronograma' }),
    ).toHaveAttribute('href', '/obras/obra/cronograma')
  })
})
