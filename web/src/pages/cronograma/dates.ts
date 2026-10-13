export function dateLabel(value: string | null, timeZone: string): string {
  return value
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone,
      }).format(new Date(value))
    : '—'
}

export function localInput(value = new Date().toISOString()): string {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

export function inputToIso(value: string): string {
  return new Date(value).toISOString()
}
