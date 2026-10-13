import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  analisarAtraso,
  createAtraso,
  getCronograma,
} from '../../api/generated/cronograma/cronograma'
import type { Atraso, Etapa } from '../../api/generated/models'
import { errorMessage } from '../../api/errors'
import { dateLabel } from './dates'
import { DependenciasDialog, EtapaDialog, ExecucaoDialog } from './EtapaDialogs'
import { SugestoesDialog } from './SugestoesDialog'

const estados = {
  NAO_INICIADA: 'Não iniciada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
}

export function CronogramaPage() {
  const { obraId = '' } = useParams()
  const client = useQueryClient()
  const cronograma = useQuery({
    queryKey: ['cronograma', obraId],
    queryFn: async ({ signal }) =>
      (await getCronograma(obraId, { signal })).data,
  })
  const [novaEtapa, setNovaEtapa] = useState(false)
  const [dependencias, setDependencias] = useState<Etapa | null>(null)
  const [execucao, setExecucao] = useState<Etapa | null>(null)
  const [atrasada, setAtrasada] = useState<Etapa | null>(null)
  const [ativo, setAtivo] = useState<Atraso | null>(null)
  const [motivo, setMotivo] = useState('')
  const [dias, setDias] = useState('1')
  const [sucesso, setSucesso] = useState('')
  const atualizar = async () => {
    await client.invalidateQueries({ queryKey: ['cronograma', obraId] })
  }
  const analisado = (atraso: Atraso) => {
    setAtivo(atraso)
    void atualizar()
  }
  const analisarAutomatico = useMutation({
    mutationFn: async (id: string) => (await analisarAtraso(obraId, id)).data,
    onSuccess: analisado,
    onSettled: atualizar,
  })
  const registrar = useMutation({
    mutationFn: async () =>
      (
        await createAtraso(obraId, {
          etapaId: atrasada!.id,
          motivo,
          diasAtraso: Number(dias),
        })
      ).data,
    onSuccess: async (atraso) => {
      setAtrasada(null)
      setAtivo(atraso)
      await atualizar()
      analisarAutomatico.mutate(atraso.id)
    },
  })
  const salvo = async () => {
    setNovaEtapa(false)
    setDependencias(null)
    setExecucao(null)
    await atualizar()
  }
  const aplicado = async () => {
    setAtivo(null)
    setSucesso('Sequência e datas atualizadas. O histórico foi salvo.')
    await atualizar()
  }

  if (cronograma.isPending)
    return (
      <Container sx={{ py: 5 }}>
        <CircularProgress aria-label="Carregando cronograma" />
      </Container>
    )
  if (cronograma.isError)
    return (
      <Container sx={{ py: 5 }}>
        <Button href="/">Voltar às obras</Button>
        <Alert
          severity="error"
          action={
            <Button onClick={() => cronograma.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {errorMessage(cronograma.error)}
        </Alert>
      </Container>
    )
  const data = cronograma.data
  const etapas = data.cronograma.etapas
  const planejamentoIncompleto = etapas.some(
    (etapa) => !etapa.inicio || !etapa.fim || !etapa.duracaoDias,
  )
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Button href="/">← Obras</Button>
          <Typography component="h1" variant="h4">
            {data.descricao}
          </Typography>
          <Typography color="text.secondary">
            Cronograma · Horários em {data.fusoHorario}
          </Typography>
        </Box>
        {sucesso && (
          <Alert severity="success" onClose={() => setSucesso('')}>
            {sucesso}
          </Alert>
        )}
        {planejamentoIncompleto && (
          <Alert severity="info">
            Esta obra contém etapas sem datas ou duração cadastradas. A
            reprogramação exige o planejamento completo. Para testar o fluxo,
            crie uma obra e cadastre etapas com datas e duração.
          </Alert>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">Sequência das etapas</Typography>
          <Button variant="contained" onClick={() => setNovaEtapa(true)}>
            Nova etapa
          </Button>
        </Stack>
        {etapas.length === 0 && (
          <Alert severity="info">
            Cadastre as etapas e suas dependências para acompanhar esta obra.
          </Alert>
        )}
        <Stack spacing={2} component="ol" sx={{ listStyle: 'none', p: 0 }}>
          {etapas.map((etapa) => {
            const pendentes = etapa.predecessores.filter(
              (id) => etapas.find((e) => e.id === id)?.status !== 'CONCLUIDA',
            )
            const risco = data.atrasos.some(
              (a) => a.etapaId === etapa.id && a.status !== 'APLICADO',
            )
            return (
              <Paper
                component="li"
                key={etapa.id}
                sx={{
                  p: 3,
                  borderLeft: '5px solid',
                  borderColor: risco
                    ? 'warning.main'
                    : etapa.status === 'CONCLUIDA'
                      ? 'success.main'
                      : 'primary.main',
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip label={etapa.ordem + 1} color="primary" />
                    <Typography variant="h6">{etapa.descricao}</Typography>
                    <Chip size="small" label={estados[etapa.status]} />
                    {risco && (
                      <Chip
                        size="small"
                        color="warning"
                        label="Previsão de atraso"
                      />
                    )}
                    {pendentes.length > 0 && (
                      <Chip size="small" label="Aguardando predecessoras" />
                    )}
                  </Stack>
                  <Typography>
                    Previsão: {dateLabel(etapa.inicio, data.fusoHorario)} →{' '}
                    {dateLabel(etapa.fim, data.fusoHorario)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Planejamento original:{' '}
                    {dateLabel(etapa.inicioOriginal, data.fusoHorario)} →{' '}
                    {dateLabel(etapa.fimOriginal, data.fusoHorario)}
                  </Typography>
                  {etapa.inicioReal && (
                    <Typography variant="body2">
                      Execução real:{' '}
                      {dateLabel(etapa.inicioReal, data.fusoHorario)} →{' '}
                      {dateLabel(etapa.fimReal, data.fusoHorario)}
                    </Typography>
                  )}
                  {etapa.predecessores.length > 0 && (
                    <Typography variant="body2">
                      Depende de:{' '}
                      {etapa.predecessores
                        .map((id) => etapas.find((e) => e.id === id)?.descricao)
                        .join(', ')}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      disabled={
                        planejamentoIncompleto || etapa.status === 'CONCLUIDA'
                      }
                      onClick={() => {
                        setMotivo('')
                        setDias('1')
                        registrar.reset()
                        setAtrasada(etapa)
                      }}
                    >
                      Informar previsão de atraso
                    </Button>
                    <Button
                      disabled={
                        etapa.status === 'CONCLUIDA' || pendentes.length > 0
                      }
                      onClick={() => setExecucao(etapa)}
                    >
                      Registrar execução
                    </Button>
                    <Button
                      disabled={etapa.status !== 'NAO_INICIADA'}
                      onClick={() => setDependencias(etapa)}
                    >
                      Dependências
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )
          })}
        </Stack>
        {data.atrasos.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Apontamentos e histórico</Typography>
              {data.atrasos.map((a) => (
                <Box
                  key={a.id}
                  sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}
                >
                  <Typography fontWeight={600}>
                    {etapas.find((e) => e.id === a.etapaId)?.descricao} ·{' '}
                    {a.diasAtraso} dia(s)
                  </Typography>
                  <Typography variant="body2">
                    {a.motivo} · {dateLabel(a.criadoEm, data.fusoHorario)}
                  </Typography>
                  {a.status === 'APLICADO' ? (
                    <Typography variant="body2" color="success.main">
                      Aplicado · {a.selecionadas.length} etapa(s) antecipada(s)
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {a.status === 'FALHOU'
                        ? a.erro
                        : a.status === 'PRONTO'
                          ? 'Sugestões disponíveis'
                          : a.status === 'ANALISANDO'
                            ? 'Análise em andamento'
                            : 'Atraso registrado'}
                    </Typography>
                  )}
                  <Button onClick={() => setAtivo(a)}>
                    {a.status === 'APLICADO'
                      ? 'Ver resultado'
                      : 'Abrir sugestões'}
                  </Button>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
      {novaEtapa && (
        <EtapaDialog
          obraId={obraId}
          etapas={etapas}
          onClose={() => setNovaEtapa(false)}
          onSaved={salvo}
        />
      )}
      {dependencias && (
        <DependenciasDialog
          obraId={obraId}
          etapas={etapas}
          etapa={dependencias}
          onClose={() => setDependencias(null)}
          onSaved={salvo}
        />
      )}
      {execucao && (
        <ExecucaoDialog
          obraId={obraId}
          etapa={execucao}
          onClose={() => setExecucao(null)}
          onSaved={salvo}
        />
      )}
      {ativo && (
        <SugestoesDialog
          key={`${ativo.id}-${ativo.referencia}`}
          obraId={obraId}
          atraso={ativo}
          etapas={etapas}
          versao={data.cronograma.versao}
          fuso={data.fusoHorario}
          onClose={() => setAtivo(null)}
          onAnalyzed={analisado}
          onApplied={aplicado}
          analyzing={analisarAutomatico.isPending}
          analysisError={
            analisarAutomatico.isError
              ? errorMessage(analisarAutomatico.error)
              : null
          }
        />
      )}
      <Dialog
        open={!!atrasada}
        fullWidth
        onClose={registrar.isPending ? undefined : () => setAtrasada(null)}
      >
        <DialogTitle>Previsão de atraso: {atrasada?.descricao}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Motivo do atraso"
              multiline
              minRows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              inputProps={{ maxLength: 2000 }}
            />
            <TextField
              label="Dias adicionais previstos"
              type="number"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              inputProps={{ min: 1, max: 3650 }}
            />
            {registrar.isError && (
              <Alert severity="error">{errorMessage(registrar.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={registrar.isPending}
            onClick={() => setAtrasada(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={
              registrar.isPending ||
              !motivo.trim() ||
              !Number.isInteger(Number(dias)) ||
              Number(dias) < 1 ||
              Number(dias) > 3650
            }
            onClick={() => registrar.mutate()}
          >
            {registrar.isPending ? 'Salvando…' : 'Salvar e buscar sugestões'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
