import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#315c4c',
    },
    secondary: {
      main: '#c17b45',
    },
    background: {
      default: '#f5f7f5',
    },
  },
  shape: {
    borderRadius: 12,
  },
})
