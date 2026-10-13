import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  createEtapa,
  updateDependencias,
  updateExecucao,
} from '../../api/generated/cronograma/cronograma'
import type { Etapa, StatusEtapa } from '../../api/generated/models'
import { errorMessage } from '../../api/errors'
import { inputToIso, localInput } from './dates'

interface Props {
  obraId: string
  etapas: Etapa[]
  onClose: () => void
  onSaved: () => Promise<void>
}

export function EtapaDialog({ obraId, etapas, onClose, onSaved }: Props) {
  const [descricao, setDescricao] = useState('')
  const [inicio, setInicio] = useState(localInput())
  const [duracao, setDuracao] = useState('1')
  const [predecessores, setPredecessores] = useState<string[]>([])
  const salvar = useMutation({
    mutationFn: () =>
      createEtapa(obraId, {
        descricao,
        inicio: inputToIso(inicio),
        duracaoDias: Number(duracao),
        predecessores,
      }),
    onSuccess: onSaved,
  })
  return (
    <Dialog open fullWidth onClose={salvar.isPending ? undefined : onClose}>
      <DialogTitle>Nova etapa</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
          <TextField
            label="Início planejado"
            type="datetime-local"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Horário local do dispositivo."
          />
          <TextField
            label="Duração em dias corridos"
            type="number"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            inputProps={{ min: 1, max: 3650 }}
          />
          <Dependencias
            etapas={etapas}
            ids={predecessores}
            onChange={setPredecessores}
          />
          {salvar.isError && (
            <Alert severity="error">{errorMessage(salvar.error)}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={salvar.isPending} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={
            salvar.isPending ||
            !descricao.trim() ||
            !inicio ||
            !Number.isInteger(Number(duracao)) ||
            Number(duracao) < 1 ||
            Number(duracao) > 3650
          }
          onClick={() => salvar.mutate()}
        >
          Cadastrar etapa
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function DependenciasDialog({
  obraId,
  etapas,
  etapa,
  onClose,
  onSaved,
}: Props & { etapa: Etapa }) {
  const [ids, setIds] = useState(etapa.predecessores)
  const salvar = useMutation({
    mutationFn: () =>
      updateDependencias(obraId, etapa.id, { predecessores: ids }),
    onSuccess: onSaved,
  })
  return (
    <Dialog open fullWidth onClose={salvar.isPending ? undefined : onClose}>
      <DialogTitle>Dependências: {etapa.descricao}</DialogTitle>
      <DialogContent>
        <Dependencias
          etapas={etapas.filter((e) => e.id !== etapa.id)}
          ids={ids}
          onChange={setIds}
        />
        {salvar.isError && (
          <Alert severity="error">{errorMessage(salvar.error)}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={salvar.isPending} onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={salvar.isPending} onClick={() => salvar.mutate()}>
          Salvar dependências
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function Dependencias({
  etapas,
  ids,
  onChange,
}: {
  etapas: Etapa[]
  ids: string[]
  onChange: (ids: string[]) => void
}) {
  return (
    <Stack>
      <Typography fontWeight={600}>
        Predecessoras obrigatórias (fim → início)
      </Typography>
      {etapas.length === 0 && (
        <Typography variant="body2">Nenhuma etapa cadastrada.</Typography>
      )}
      {etapas.map((e) => (
        <FormControlLabel
          key={e.id}
          label={e.descricao}
          control={
            <Checkbox
              checked={ids.includes(e.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...ids, e.id]
                    : ids.filter((id) => id !== e.id),
                )
              }
            />
          }
        />
      ))}
    </Stack>
  )
}

export function ExecucaoDialog({
  obraId,
  etapa,
  onClose,
  onSaved,
}: Omit<Props, 'etapas'> & { etapa: Etapa }) {
  const [status, setStatus] = useState<StatusEtapa>('EM_ANDAMENTO')
  const [inicio, setInicio] = useState(
    localInput(etapa.inicioReal ?? undefined),
  )
  const [fim, setFim] = useState(localInput())
  const salvar = useMutation({
    mutationFn: () =>
      updateExecucao(obraId, etapa.id, {
        status,
        inicioReal: etapa.inicioReal ?? inputToIso(inicio),
        fimReal: status === 'CONCLUIDA' ? inputToIso(fim) : null,
      }),
    onSuccess: onSaved,
  })
  return (
    <Dialog open fullWidth onClose={salvar.isPending ? undefined : onClose}>
      <DialogTitle>Registrar execução: {etapa.descricao}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Estado da etapa"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusEtapa)}
          >
            <MenuItem value="EM_ANDAMENTO">Em andamento</MenuItem>
            <MenuItem value="CONCLUIDA">Concluída</MenuItem>
          </TextField>
          <TextField
            label="Início real"
            type="datetime-local"
            value={inicio}
            disabled={!!etapa.inicioReal}
            onChange={(e) => setInicio(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Horário local do dispositivo."
          />
          {status === 'CONCLUIDA' && (
            <TextField
              label="Término real"
              type="datetime-local"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
          {salvar.isError && (
            <Alert severity="error">{errorMessage(salvar.error)}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={salvar.isPending} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          disabled={
            salvar.isPending || !inicio || (status === 'CONCLUIDA' && !fim)
          }
          onClick={() => salvar.mutate()}
        >
          Salvar execução
        </Button>
      </DialogActions>
    </Dialog>
  )
}
