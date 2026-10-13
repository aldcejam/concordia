import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CronogramaPage } from './pages/cronograma/CronogramaPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/obras/:obraId/cronograma',
    element: <CronogramaPage />,
  },
])
