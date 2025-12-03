import { User, LogOut, Trophy, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onLoginClick: () => void;
  onLeaderboardClick: () => void;
  onWatchClick: () => void;
  activeTab: 'game' | 'leaderboard' | 'watch';
}

export default function Header({
  onLoginClick,
  onLeaderboardClick,
  onWatchClick,
  activeTab,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const navButtonClass = (active: boolean) => cn(
    'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
    active
      ? 'text-primary border-b-2 border-primary'
      : 'text-muted-foreground hover:text-foreground'
  );

  return (
    <header className="border-b border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <h1 className="font-pixel text-xl neon-text arcade-flicker">
            SNAKE
          </h1>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => activeTab !== 'game' && window.location.reload()}
              className={navButtonClass(activeTab === 'game')}
            >
              Play
            </button>
            <button
              onClick={onLeaderboardClick}
              className={navButtonClass(activeTab === 'leaderboard')}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
            <button
              onClick={onWatchClick}
              className={navButtonClass(activeTab === 'watch')}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Watch</span>
            </button>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className={cn(
                  'btn-arcade text-xs py-2 px-4',
                  'bg-primary text-primary-foreground border-primary',
                  'hover:bg-primary/90'
                )}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
