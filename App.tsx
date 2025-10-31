import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Roadmap } from './types';
import { generateRoadmap } from './services/geminiService';
import RoleSelector from './components/RoleSelector';
import RoadmapDisplay from './components/RoadmapDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import { SunIcon, MoonIcon } from './components/icons';

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
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]">
            Smart Career Pathfinder
          </h1>
          <div className="flex items-center gap-4">
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

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
