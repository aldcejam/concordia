import { Routes, Route, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TimelinePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
