import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RocketIcon } from './icons';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
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
            Start Your Journey
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Create an account to track your career progress
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                placeholder="John Doe"
              />
            </div>

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
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--muted-foreground)] text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[var(--primary)] hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-6 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg p-4">
          <p className="text-xs font-semibold text-[var(--foreground)] mb-2">✨ With an account, you'll get:</p>
          <ul className="text-xs text-[var(--muted-foreground)] space-y-1">
            <li>• Save and track multiple career roadmaps</li>
            <li>• Mark phases and courses as completed</li>
            <li>• Access your progress from any device</li>
            <li>• Personalized learning recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;

