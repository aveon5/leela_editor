import { useState, useEffect } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import { Loader2 } from 'lucide-react';

function App() {
  const initialized = useStore((state) => state.initialized);
  const loading = useStore((state) => state.loading);
  const token = useStore((state) => state.token);
  const init = useStore((state) => state.init);

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Attempt to restore session
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken && !initialized && !loading) {
      // We can iterate to find a saved repo or just ask user again?
      // For better UX, let's just ask user to sign in if we don't store repo details.
      // Or we can modify store to save repo details in localStorage.
      // user requested simplicity. Logic in Login component handles new login.
      // If we want auto-login, we need repo details.
      // Let's skip auto-login for now to keep it simple and robust, or user can re-enter.
      // Actually, I'll update store to save repo details too.
    }
  }, []);

  const handleSelectCard = (id) => {
    setSelectedCardId(id);
    setCurrentView('editor');
  };

  const handleCloseEditor = () => {
    setSelectedCardId(null);
    setCurrentView('dashboard');
  };

  if (!initialized) {
    return <Login />;
  }

  if (currentView === 'editor' && selectedCardId) {
    return <Editor cardId={selectedCardId} onClose={handleCloseEditor} />;
  }

  return <Dashboard onSelectCard={handleSelectCard} />;
}

export default App;
