import { useState } from 'react';
import type { GameMode } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Header from '@/components/layout/Header';
import SnakeGame from '@/components/game/SnakeGame';
import AuthModal from '@/components/auth/AuthModal';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import WatchMode from '@/components/watch/WatchMode';
import { toast } from 'sonner';

type Tab = 'game' | 'leaderboard' | 'watch';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const handleScoreSubmit = async (score: number, mode: GameMode) => {
    if (!user) {
      toast.info('Log in to save your score to the leaderboard!');
      return;
    }

    try {
      const response = await api.leaderboard.submitScore(score, mode);
      if (response.success && response.data) {
        toast.success(`Score submitted! Rank: #${response.data.rank}`);
      }
    } catch {
      toast.error('Failed to submit score');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLeaderboardClick={() => setActiveTab('leaderboard')}
        onWatchClick={() => setActiveTab('watch')}
        activeTab={activeTab}
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {activeTab === 'game' && (
          <div className="max-w-2xl mx-auto">
            <SnakeGame onScoreSubmit={handleScoreSubmit} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <Leaderboard />
            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveTab('game')}
                className="btn-arcade bg-primary text-primary-foreground border-primary hover:bg-primary/90 neon-border"
              >
                Play Now
              </button>
            </div>
          </div>
        )}

        {activeTab === 'watch' && (
          <div className="max-w-4xl mx-auto">
            <WatchMode onBack={() => setActiveTab('game')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        <p>Classic Snake Game • Built with React</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
