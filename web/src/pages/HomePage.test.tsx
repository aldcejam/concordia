import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { HomePage } from './HomePage'
import { theme } from '../theme'

describe('HomePage', () => {
  it('apresenta o nome do projeto', () => {
    render(
      <ThemeProvider theme={theme}>
        <HomePage />
      </ThemeProvider>,
    )

    expect(screen.getByText('CONCORDIA')).toBeInTheDocument()
  })
})
