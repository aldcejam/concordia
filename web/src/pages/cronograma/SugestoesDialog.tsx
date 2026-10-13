import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ArrowDownward, ArrowUpward } from '@mui/icons-material'
import {
  analisarAtraso,
  aplicarAtraso,
  simularAtraso,
} from '../../api/generated/cronograma/cronograma'
import type { Atraso, Etapa } from '../../api/generated/models'
import { errorMessage } from '../../api/errors'
import { dateLabel } from './dates'

interface Props {
  obraId: string
  atraso: Atraso
  etapas: Etapa[]
  versao: number
  fuso: string
  onClose: () => void
  onAnalyzed: (atraso: Atraso) => void
  onApplied: () => Promise<void>
  analyzing?: boolean
  analysisError?: string | null
}

export function SugestoesDialog({
  obraId,
  atraso,
  etapas,
  versao,
  fuso,
  onClose,
  onAnalyzed,
  onApplied,
  analyzing = false,
  analysisError,
}: Props) {
  const [itens, setItens] = useState(() =>
    atraso.sugestoes.map((sugestao) => ({ ...sugestao, selecionada: false })),
  )
  const selecionadas = itens
    .filter((item) => item.selecionada)
    .map((item) => item.etapaId)
  const desatualizado = atraso.versaoCronograma !== versao
  const simulacao = useQuery({
    queryKey: [
      'simulacao',
      obraId,
      atraso.id,
      atraso.referencia,
      versao,
      selecionadas,
    ],
    queryFn: async ({ signal }) =>
      (
        await simularAtraso(
          obraId,
          atraso.id,
          { etapaIds: selecionadas },
          { signal },
        )
      ).data,
    enabled: atraso.status === 'PRONTO' && !desatualizado,
    retry: false,
  })
  const analisar = useMutation({
    mutationFn: async () => (await analisarAtraso(obraId, atraso.id)).data,
    onSuccess: (resultado) => onAnalyzed(resultado),
  })
  const aplicar = useMutation({
    mutationFn: () =>
      aplicarAtraso(obraId, atraso.id, { etapaIds: selecionadas }),
    onSuccess: onApplied,
  })
  const ocupado = analisar.isPending || aplicar.isPending || analyzing
  const nome = (id: string) =>
    etapas.find((etapa) => etapa.id === id)?.descricao ?? 'Etapa indisponível'
  const mover = (index: number, delta: number) =>
    setItens((atual) => {
      const copia = [...atual]
      ;[copia[index], copia[index + delta]] = [
        copia[index + delta],
        copia[index],
      ]
      return copia
    })
  return (
    <Dialog
      open
      fullWidth
      maxWidth="lg"
      onClose={ocupado ? undefined : onClose}
    >
      <DialogTitle>Reprogramar após atraso: {nome(atraso.etapaId)}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography>
            {atraso.motivo} · Previsão de {atraso.diasAtraso} dia(s) adicionais.
          </Typography>
          {atraso.erro && <Alert severity="error">{atraso.erro}</Alert>}
          {desatualizado && atraso.status !== 'APLICADO' && (
            <Alert severity="warning">
              O cronograma mudou. Gere novas sugestões antes de confirmar.
            </Alert>
          )}
          {analysisError && <Alert severity="error">{analysisError}</Alert>}
          {analisar.isError && (
            <Alert severity="error">{errorMessage(analisar.error)}</Alert>
          )}
          {(analisar.isPending || analyzing) && (
            <Alert severity="info">
              Analisando as etapas da obra… O apontamento já está salvo.
            </Alert>
          )}
          {atraso.status !== 'APLICADO' && (
            <Button disabled={ocupado} onClick={() => analisar.mutate()}>
              {analisar.isPending ? 'Analisando…' : 'Gerar novas sugestões'}
            </Button>
          )}
          {atraso.status === 'PRONTO' && (
            <>
              <Typography variant="h6">
                Escolha as etapas e a ordem de prioridade
              </Typography>
              <Typography color="text.secondary">
                As selecionadas serão posicionadas logo após a etapa com atraso.
                Use as setas para ajustar a sequência. Etapas independentes
                podem começar em paralelo; confirme equipes e frentes
                disponíveis na obra.
              </Typography>
              {itens.length === 0 && (
                <Alert severity="info">
                  Não há sugestões de adiantamento nesta análise. Você pode
                  confirmar apenas a atualização das datas pelo atraso.
                </Alert>
              )}
              <Stack
                spacing={1}
                component="ol"
                sx={{ pl: 0, listStyle: 'none' }}
              >
                {itens.map((item, index) => (
                  <Paper
                    component="li"
                    variant="outlined"
                    key={item.etapaId}
                    sx={{ p: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Checkbox
                        checked={item.selecionada}
                        disabled={ocupado}
                        inputProps={{
                          'aria-label': `Adiantar ${nome(item.etapaId)}`,
                        }}
                        onChange={(event) =>
                          setItens((atual) =>
                            atual.map((i) =>
                              i.etapaId === item.etapaId
                                ? { ...i, selecionada: event.target.checked }
                                : i,
                            ),
                          )
                        }
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>
                          {index + 1}. {nome(item.etapaId)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.justificativa}
                        </Typography>
                      </Box>
                      <IconButton
                        aria-label={`Mover ${nome(item.etapaId)} para cima`}
                        disabled={index === 0 || ocupado}
                        onClick={() => mover(index, -1)}
                      >
                        <ArrowUpward />
                      </IconButton>
                      <IconButton
                        aria-label={`Mover ${nome(item.etapaId)} para baixo`}
                        disabled={index === itens.length - 1 || ocupado}
                        onClick={() => mover(index, 1)}
                      >
                        <ArrowDownward />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <Typography variant="h6">
                Prévia da sequência e das datas
              </Typography>
              {simulacao.isFetching && (
                <CircularProgress size={24} aria-label="Calculando prévia" />
              )}
              {simulacao.isError && (
                <Alert severity="error">{errorMessage(simulacao.error)}</Alert>
              )}
              {simulacao.data && !desatualizado && (
                <>
                  <Typography>
                    Término previsto da obra:{' '}
                    {dateLabel(simulacao.data.terminoAntes, fuso)} →{' '}
                    {dateLabel(simulacao.data.terminoDepois, fuso)}
                  </Typography>
                  <TableContainer>
                    <Table size="small" aria-label="Prévia da reprogramação">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nova ordem</TableCell>
                          <TableCell>Etapa</TableCell>
                          <TableCell>Início atual → proposto</TableCell>
                          <TableCell>Término atual → proposto</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {simulacao.data.depois.etapas.map((etapa) => {
                          const anterior = simulacao.data.antes.etapas.find(
                            (e) => e.id === etapa.id,
                          )!
                          return (
                            <TableRow
                              key={etapa.id}
                              selected={selecionadas.includes(etapa.id)}
                            >
                              <TableCell>{etapa.ordem + 1}</TableCell>
                              <TableCell>
                                {etapa.descricao}
                                {etapa.id === atraso.etapaId ? ' · Atraso' : ''}
                              </TableCell>
                              <TableCell>
                                {dateLabel(anterior.inicio, fuso)} →{' '}
                                {dateLabel(etapa.inicio, fuso)}
                              </TableCell>
                              <TableCell>
                                {dateLabel(anterior.fim, fuso)} →{' '}
                                {dateLabel(etapa.fim, fuso)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          )}
          {aplicar.isError && (
            <Alert severity="error">{errorMessage(aplicar.error)}</Alert>
          )}
          {atraso.status === 'APLICADO' && atraso.resultado && (
            <>
              <Alert severity="success">
                Reprogramação aplicada. Etapas antecipadas:{' '}
                {atraso.selecionadas.map(nome).join(', ') || 'Nenhuma'}.
              </Alert>
              <Typography>
                Término previsto:{' '}
                {dateLabel(atraso.resultado.terminoAntes, fuso)} →{' '}
                {dateLabel(atraso.resultado.terminoDepois, fuso)}
              </Typography>
              {atraso.resultado.depois.etapas.map((e) => (
                <Typography key={e.id}>
                  {e.ordem + 1}. {e.descricao} · {dateLabel(e.inicio, fuso)} →{' '}
                  {dateLabel(e.fim, fuso)}
                </Typography>
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={ocupado} onClick={onClose}>
          Fechar
        </Button>
        <Button
          variant="contained"
          disabled={
            ocupado ||
            desatualizado ||
            atraso.status !== 'PRONTO' ||
            !simulacao.data ||
            simulacao.isFetching ||
            simulacao.isError
          }
          onClick={() => aplicar.mutate()}
        >
          {aplicar.isPending ? 'Aplicando…' : 'Confirmar sequência e datas'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
