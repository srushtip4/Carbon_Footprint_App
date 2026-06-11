import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CarbonMathPage from './components/education/CarbonMathPage';
import QuizPage from './components/quiz/QuizPage';
import DashboardPage from './components/dashboard/DashboardPage';
import ActionCenter from './components/actions/ActionCenter';
import GardenPage from './components/garden/GardenPage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('education');

  useEffect(() => {
    const handler = (e: Event) => setCurrentPage((e as CustomEvent).detail);
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  const navigate = (page: string) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case 'auth': return <AuthPage />;
      case 'education': return <CarbonMathPage />;
      case 'dashboard': return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
      case 'quiz': return <ProtectedRoute><QuizPage /></ProtectedRoute>;
      case 'actions': return <ProtectedRoute><ActionCenter /></ProtectedRoute>;
      case 'garden': return <ProtectedRoute><GardenPage /></ProtectedRoute>;
      case 'leaderboard': return <ProtectedRoute><LeaderboardPage /></ProtectedRoute>;
      default: return <CarbonMathPage />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={navigate}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// sync check
