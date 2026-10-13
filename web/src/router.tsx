import { Routes, Route, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import ObrasPage from './pages/ObrasPage';
import NovaObraPage from './pages/NovaObraPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TimelinePage />} />
      <Route path="/obras" element={<ObrasPage />} />
      <Route path="/obras/nova" element={<NovaObraPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
