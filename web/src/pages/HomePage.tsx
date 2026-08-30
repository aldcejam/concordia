import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'

export function HomePage() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          py: 4,
        }}
      >
        <Paper elevation={2} sx={{ width: '100%', p: { xs: 4, md: 7 } }}>
          <Stack spacing={3} alignItems="flex-start">
            <Typography color="primary" fontWeight={700} letterSpacing={1}>
              CONCORDIA
            </Typography>
            <Typography component="h1" variant="h3">
              Uma base pronta para construir em conjunto.
            </Typography>
            <Typography color="text.secondary" variant="h6">
              React, Material UI e uma API Spring Boot conectados por um
              contrato OpenAPI.
            </Typography>
            <Button
              variant="contained"
              href="http://localhost:8080/swagger"
            >
              Abrir documentação da API
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  )
}
