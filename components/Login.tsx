import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RocketIcon } from './icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="animate-rocket">
              <RocketIcon className="w-16 h-16" style={{
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
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Sign in to continue your career journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--muted-foreground)] text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[var(--primary)] hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--muted-foreground)] bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg p-4">
            💡 <strong>Demo:</strong> Create an account to get started, or use any email/password you've previously registered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

