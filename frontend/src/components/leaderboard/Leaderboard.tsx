import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import type { LeaderboardEntry, GameMode } from '@/types';
import api from '@/services/api';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  className?: string;
}

export default function Leaderboard({ className }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const response = await api.leaderboard.getAll(filter === 'all' ? undefined : filter);
    if (response.success && response.data) {
      setEntries(response.data);
    }
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-neon-pink" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-lg neon-text-cyan">LEADERBOARD</h2>
        <div className="flex gap-2">
          {(['all', 'walls', 'pass-through'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={cn(
                'px-3 py-1 text-xs uppercase tracking-wider border transition-colors',
                filter === mode
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-transparent text-muted-foreground border-muted hover:border-accent'
              )}
            >
              {mode === 'all' ? 'All' : mode === 'walls' ? 'Walls' : 'Pass'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-primary/30 bg-card/50">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-primary/20 text-xs text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-3 text-right">Score</div>
          <div className="col-span-3 text-right">Mode</div>
        </div>

        {/* Entries */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  'grid grid-cols-12 gap-2 px-4 py-3 leaderboard-row',
                  index < 3 && 'bg-muted/20'
                )}
              >
                <div className="col-span-1 flex items-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-5 flex items-center">
                  <span className={cn(
                    'font-medium',
                    index === 0 && 'text-neon-yellow neon-text',
                    index === 1 && 'text-foreground',
                    index === 2 && 'text-neon-pink'
                  )}>
                    {entry.username}
                  </span>
                </div>
                <div className="col-span-3 text-right font-mono">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-3 text-right">
                  <span className={cn(
                    'text-xs px-2 py-1',
                    entry.mode === 'walls'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/20 text-secondary'
                  )}>
                    {entry.mode === 'walls' ? 'Walls' : 'Pass'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
