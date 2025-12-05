import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (authMode === 'login') {
        result = await login(email, password);
      } else {
        if (!username.trim()) {
          toast.error('Username is required');
          setIsLoading(false);
          return;
        }
        result = await signup(email, password, username);
      }

      if (result.success) {
        toast.success(authMode === 'login' ? 'Welcome back!' : 'Account created!');
        onClose();
        setEmail('');
        setPassword('');
        setUsername('');
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = cn(
    'w-full px-4 py-3 bg-input border-2 border-primary/30',
    'text-foreground placeholder:text-muted-foreground',
    'focus:border-primary focus:outline-none focus:ring-0',
    'transition-colors'
  );

  const buttonClass = cn(
    'w-full btn-arcade bg-primary text-primary-foreground border-primary',
    'hover:bg-primary/90 neon-border disabled:opacity-50'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border-2 border-primary neon-border p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="font-pixel text-xl text-center mb-8 neon-text">
          {authMode === 'login' ? 'LOGIN' : 'SIGN UP'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="Enter username"
                required={authMode === 'signup'}
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={isLoading} className={buttonClass}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : authMode === 'login' ? (
              'Login'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-primary hover:underline"
          >
            {authMode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>

        {/* Demo credentials */}
        {authMode === 'login' && (
          <div className="mt-6 p-3 bg-muted/50 border border-border text-xs">
            <p className="text-muted-foreground mb-1">Demo credentials:</p>
            <p className="text-foreground">player1@example.com / password123</p>
          </div>
        )}
      </div>
    </div>
  );
}
