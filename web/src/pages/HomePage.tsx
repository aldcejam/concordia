import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { createObra, getObras } from '../api/generated/obras/obras'
import { Uf } from '../api/generated/models'
import { errorMessage } from '../api/errors'

export function HomePage() {
  const client = useQueryClient()
  const obras = useQuery({
    queryKey: ['obras'],
    queryFn: async ({ signal }) => (await getObras({ signal })).data,
  })
  const [descricao, setDescricao] = useState('')
  const [uf, setUf] = useState<Uf>('RN')
  const [fuso, setFuso] = useState('America/Fortaleza')
  const criar = useMutation({
    mutationFn: () => createObra({ descricao, uf, fusoHorario: fuso }),
    onSuccess: async () => {
      setDescricao('')
      await client.invalidateQueries({ queryKey: ['obras'] })
    },
  })
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack spacing={3}>
        <Box>
          <Typography color="primary" fontWeight={700} letterSpacing={1}>
            CONCORDIA
          </Typography>
          <Typography component="h1" variant="h3" sx={{ mt: 1 }}>
            Obras e cronogramas
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Acompanhe etapas e reorganize o trabalho quando houver previsão de
            atraso.
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Suas obras
          </Typography>
          {obras.isPending && (
            <CircularProgress aria-label="Carregando obras" />
          )}
          {obras.isError && (
            <Alert
              severity="error"
              action={
                <Button onClick={() => obras.refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              {errorMessage(obras.error)}
            </Alert>
          )}
          {obras.data?.length === 0 && (
            <Typography color="text.secondary">
              Cadastre uma obra para começar.
            </Typography>
          )}
          <Stack spacing={2}>
            {obras.data?.map((obra) => (
              <Paper key={obra.id} variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box>
                    <Typography fontWeight={600}>{obra.descricao}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {obra.uf}
                    </Typography>
                  </Box>
                  <Button href={`/obras/${obra.id}/cronograma`}>
                    Abrir cronograma
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
        <Paper
          component="form"
          sx={{ p: 3 }}
          onSubmit={(event) => {
            event.preventDefault()
            criar.mutate()
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Nova obra</Typography>
            <TextField
              label="Nome da obra"
              required
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
            <TextField
              select
              label="UF"
              value={uf}
              onChange={(event) => setUf(event.target.value as Uf)}
            >
              {Object.values(Uf).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fuso horário da obra"
              required
              value={fuso}
              onChange={(event) => setFuso(event.target.value)}
              helperText="Ex.: America/Fortaleza ou America/Sao_Paulo"
            />
            {criar.isError && (
              <Alert severity="error">{errorMessage(criar.error)}</Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={criar.isPending || !descricao.trim()}
            >
              {criar.isPending ? 'Cadastrando…' : 'Cadastrar obra'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
