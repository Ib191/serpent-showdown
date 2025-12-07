import { useState, useEffect, useRef } from 'react';
import { Eye, Users, ArrowLeft, Loader2 } from 'lucide-react';
import type { LivePlayer } from '@/types';
import api from '@/services/api';
import GameBoard from '@/components/game/GameBoard';
import { cn } from '@/lib/utils';

interface WatchModeProps {
  onBack: () => void;
}

export default function WatchMode({ onBack }: WatchModeProps) {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Load active players
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    const response = await api.live.getActivePlayers();
    if (response.success && response.data) {
      setPlayers(response.data);
    }
    setIsLoading(false);
  };

  // Simulate AI movement when watching a player
  useEffect(() => {
    if (!selectedPlayer) return;

    const updateInterval = 200; // ms between updates

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= updateInterval) {
        const updatedPlayer = api.live.simulateMovement(selectedPlayer, 20);
        if (updatedPlayer) {
          setSelectedPlayer({ ...updatedPlayer });
          // Also update in the players list
          setPlayers(prev => prev.map(p =>
            p.id === updatedPlayer.id ? updatedPlayer : p
          ));
        }
        lastUpdateRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPlayer?.id]);

  const handleSelectPlayer = (player: LivePlayer) => {
    setSelectedPlayer(player);
    lastUpdateRef.current = 0;
  };

  const handleBackToList = () => {
    setSelectedPlayer(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Watching a specific player
  if (selectedPlayer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to list</span>
          </button>
          <div className="watching-indicator text-destructive text-sm font-medium">
            LIVE
          </div>
        </div>

        {/* Player info */}
        <div className="flex items-center justify-between p-4 bg-card border-2 border-primary/30">
          <div>
            <h3 className="font-pixel text-lg neon-text">{selectedPlayer.username}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className={cn(
                'px-2 py-0.5 text-xs',
                selectedPlayer.mode === 'walls'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary/20 text-secondary'
              )}>
                {selectedPlayer.mode === 'walls' ? 'Walls' : 'Pass-Through'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {selectedPlayer.viewers} watching
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">Score</p>
            <p className="font-pixel text-2xl neon-text-pink">{selectedPlayer.score}</p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          <GameBoard
            boardSize={20}
            snake={selectedPlayer.snake}
            food={selectedPlayer.food}
          />
        </div>
      </div>
    );
  }

  // Player list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h2 className="font-pixel text-lg neon-text-cyan">WATCH LIVE</h2>
        <div className="w-16" />
      </div>

      {/* Player Cards */}
      {players.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No players currently live. Check back later!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelectPlayer(player)}
              className={cn(
                'p-4 bg-card border-2 border-primary/30 text-left',
                'hover:border-primary hover:neon-border transition-all',
                'group'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-pixel text-sm group-hover:neon-text transition-all">
                    {player.username}
                  </h3>
                  <span className={cn(
                    'text-xs px-2 py-0.5 mt-1 inline-block',
                    player.mode === 'walls'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/20 text-secondary'
                  )}>
                    {player.mode === 'walls' ? 'Walls' : 'Pass'}
                  </span>
                </div>
                <div className="watching-indicator text-xs text-destructive">
                  LIVE
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{player.viewers}</span>
                </div>
                <div className="font-mono text-primary">
                  {player.score.toLocaleString()} pts
                </div>
              </div>

              {/* Mini preview */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${Math.min(100, player.snake.length * 10)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
