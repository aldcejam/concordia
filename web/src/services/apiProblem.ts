import type { ErroImportacao } from '@/types/importacao';

/** Corpo RFC 7807 devolvido pelo GlobalExceptionHandler da API. */
export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  erros?: ErroImportacao[];
  invalidFields?: { campo: string; mensagem: string }[];
}

/**
 * Os hooks gerados pelo Orval resolvem a promise mesmo em respostas 4xx/5xx. Este adaptador converte essas
 * respostas em erro, para que o TanStack Query exponha `isError` e o ProblemDetail fique disponível na tela.
 */
export class ApiProblemError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    super(problem.detail ?? problem.title ?? `Erro ${status}`);
    this.name = 'ApiProblemError';
  }
}

export function ensureOk<T extends { status: number; data: unknown }>(response: T): T {
  if (response.status >= 400) {
    const problem = (response.data ?? {}) as ProblemDetail;
    throw new ApiProblemError(response.status, typeof problem === 'object' ? problem : { detail: String(problem) });
  }
  return response;
}

export function problemMessage(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  if (error instanceof ApiProblemError) {
    const fields = error.problem.invalidFields?.map((f) => `${f.campo}: ${f.mensagem}`).join('; ');
    return fields ? `${error.message} (${fields})` : error.message;
  }
  if (error instanceof TypeError) {
    return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export function problemErrors(error: unknown): ErroImportacao[] {
  return error instanceof ApiProblemError ? (error.problem.erros ?? []) : [];
}
