import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Roadmap } from './types';
import { generateRoadmap } from './services/geminiService';
import RoleSelector from './components/RoleSelector';
import RoadmapDisplay from './components/RoadmapDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Login from './components/Login';
import Signup from './components/Signup';
import { SunIcon, MoonIcon, RocketIcon, UserIcon, LogOutIcon, BookmarkIcon } from './components/icons';
import PixelBlast from './components/PixelBlast';
import SavedRoadmaps from './components/SavedRoadmaps';
import Chatbot from './components/Chatbot';
import { useAuth } from './contexts/AuthContext';

// --- Theme Management ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- UI Components ---
const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-[var(--card-background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--card-border)] transition-colors"
        aria-label="User menu"
      >
        <UserIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--card-border)]">
              <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--background)] transition-colors flex items-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-[var(--card-background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--card-border)] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
    </button>
  );
};

const BackgroundAnimation: React.FC = () => (
  <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 filter blur-3xl">
    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
      <div className="w-[40vmax] h-[40vmax] rounded-full bg-[var(--primary)] opacity-20 animate-blob"></div>
    </div>
    <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
      <div className="w-[30vmax] h-[30vmax] rounded-full bg-[var(--gradient-to)] opacity-20 animate-blob animation-delay-2000"></div>
    </div>
    <div className="absolute bottom-1/2 right-1/2">
      <div className="w-[20vmax] h-[20vmax] rounded-full bg-[var(--gradient-from)] opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Show message if loading > 5 seconds
  const [showDelayMessage, setShowDelayMessage] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isLoading) {
      timer = setTimeout(() => setShowDelayMessage(true), 5000);
    } else {
      setShowDelayMessage(false);
      if (timer) clearTimeout(timer);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [isLoading]);

  // -- Handle roadmap from navigation state (from SavedRoadmaps) --
  useEffect(() => {
    if (location.state && (location.state as any).roadmap) {
      const savedRoadmap = (location.state as any).roadmap as Roadmap;
      setRoadmap(savedRoadmap);
      setSelectedRole(savedRoadmap.careerPath);
      // Clear the state to prevent re-loading on refresh
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // -- Handle browser back navigation --
  useEffect(() => {
    const onPopState = () => {
      setSelectedRole(null);
      setRoadmap(null);
      setError(null);
      setIsLoading(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSelectRole = useCallback(async (role: string) => {
    window.history.pushState({ role }, '', '#roadmap');
    setSelectedRole(role);
    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    const startTime = performance.now();

    try {
      const result = await generateRoadmap(role);
      const endTime = performance.now();
      console.log(`Gemini API call for "${role}" took ${(endTime - startTime).toFixed(2)} ms`);
      setRoadmap(result);
    } catch (err) {
      console.error(err);
      setError(
        'Failed to generate roadmap. The AI might be busy, or an API key error occurred. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    window.history.pushState({}, '', '#home');
    setSelectedRole(null);
    setRoadmap(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen text-[var(--foreground)] font-sans p-4 sm:p-6 lg:p-8 relative">
      <BackgroundAnimation />
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="animate-rocket">
              <RocketIcon className="w-10 h-10 sm:w-12 sm:h-12 text-transparent bg-clip-text" style={{
                stroke: 'url(#gradient)',
                fill: 'none'
              }} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--gradient-from)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--gradient-to)', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]">
              Smart Career Pathfinder
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/saved')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-background)] text-[var(--foreground)] hover:bg-[var(--card-border)] border border-[var(--card-border)] transition-colors"
            >
              <BookmarkIcon className="w-5 h-5" />
              <span className="hidden sm:inline">My Roadmaps</span>
            </button>
            <UserProfile />
            <ThemeSwitcher />
          </div>
        </header>

        <main>
          {isLoading && (
            <>
              <LoadingSpinner />
              {showDelayMessage && (
                <div className="mt-6 text-center text-yellow-400 text-lg font-medium">
                  Still working... The roadmap is being generated by AI and may take up to a minute. Please wait!
                </div>
              )}
            </>
          )}

          {error && !isLoading && selectedRole && (
            <ErrorDisplay
              message={error}
              onRetry={() => handleSelectRole(selectedRole)}
              onReset={handleReset}
            />
          )}

          {!selectedRole && !isLoading && !error && (
            <RoleSelector onSelectRole={handleSelectRole} onBack={handleReset} />
          )}

          {roadmap && !isLoading && !error && (
            <RoadmapDisplay roadmap={roadmap} onBack={handleReset} />
          )}
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => (
  <ThemeProvider>
    <PixelBlast />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <SavedRoadmaps />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        }
      />
    </Routes>
    <Chatbot />
  </ThemeProvider>
);

export default App;