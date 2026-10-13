import axios from 'axios'

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.detail ??
      'Não foi possível acessar a API. Tente novamente.'
    )
  }
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.'
}
