import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Shared/Button';

const demoAccounts = [
  { email: 'agency-owner@demo.com', label: 'Agency Owner', description: 'Full access to all agency features' },
  { email: 'consultant-owner@demo.com', label: 'Consultant Owner', description: 'Full access to all consultant features' },
  { email: 'business-owner@demo.com', label: 'Business Owner', description: 'Full access to business features' },
  { email: 'manager@demo.com', label: 'Manager', description: 'Limited access set by owner' },
  { email: 'employee@demo.com', label: 'Employee', description: 'Standard employee access' },
  { email: 'contractor@demo.com', label: 'Contractor', description: 'Project-based access' },
  { email: 'client@demo.com', label: 'Client', description: 'View-only access to projects' },
];

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed', error);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-start)] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img 
                src="/Friday Proof - Logo 3 Transparent w Black Text.png" 
                alt="Friday Proof Logo" 
                className="h-12 w-auto object-contain dark:hidden"
              />
              <img 
                src="/Friday Proof - Logo 4 Transparent w White Text.png" 
                alt="Friday Proof Logo" 
                className="h-12 w-auto object-contain hidden dark:block"
              />
            </div>
            <h1 className="text-3xl font-bold text-[var(--fg)] mb-2">Welcome Back</h1>
            <p className="text-[var(--fg-muted)]">Sign in to your Friday Proof™ platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--fg)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-sunset-purple focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--fg)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-sunset-purple focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              glowOnHover
              wrapperClassName="w-full"
              className="w-full justify-center py-3 font-semibold"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-sm text-[var(--fg-muted)] mb-4">Quick Demo Login:</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account.email)}
                  className="bg-[var(--surface)] hover:bg-[var(--border)] rounded-lg p-3 text-left transition-colors group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-hover-glow opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm -z-10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)] group-hover:text-gradient-purple transition-colors">
                        {account.label}
                      </p>
                      <p className="text-xs text-[var(--fg-muted)] mt-1">{account.description}</p>
                    </div>
                    <div className="text-xs text-[var(--fg-muted)]">
                      Click to login
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-[var(--fg-muted)]">All demo accounts use password: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;