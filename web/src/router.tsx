import { Routes, Route, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import ImportarObraPage from './pages/ImportarObraPage';
import DependenciasPage from './pages/DependenciasPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TimelinePage />} />
      <Route path="/obras/nova" element={<ImportarObraPage />} />
      <Route path="/obras/:obraId" element={<TimelinePage />} />
      <Route path="/obras/:obraId/dependencias" element={<DependenciasPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
