import { useState, useEffect } from 'react';
import { Pause, Volume2, VolumeX } from 'lucide-react';
import type { GameMode } from '@/types';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameOverlay from './GameOverlay';
import ModeSelector from './ModeSelector';
import { cn } from '@/lib/utils';

interface SnakeGameProps {
  onScoreSubmit?: (score: number, mode: GameMode) => void;
}

export default function SnakeGame({ onScoreSubmit }: SnakeGameProps) {
  const [mode, setMode] = useState<GameMode>('walls');
  const [muted, setMuted] = useState(false);
  
  const game = useSnakeGame({ mode });
  const {
    snake,
    food,
    score,
    highScore,
    gameState,
    boardSize,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    changeDirection,
  } = game;

  // Handle mode change
  const handleModeChange = (newMode: GameMode) => {
    if (gameState === 'playing') return;
    setMode(newMode);
  };

  // Handle game over score submission
  useEffect(() => {
    if (gameState === 'game-over' && score > 0 && onScoreSubmit) {
      onScoreSubmit(score, mode);
    }
  }, [gameState, score, mode, onScoreSubmit]);

  // Pause on space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') pauseGame();
        else if (gameState === 'paused') resumeGame();
      }
      if (e.code === 'Escape' && gameState === 'playing') {
        pauseGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pauseGame, resumeGame]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode Selector */}
      <ModeSelector
        mode={mode}
        onModeChange={handleModeChange}
        disabled={gameState === 'playing'}
      />

      {/* Score Display */}
      <div className="flex justify-between items-center w-full max-w-[400px]">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="font-pixel text-xl neon-text">{score}</p>
        </div>
        <div className="flex gap-2">
          {gameState === 'playing' && (
            <button
              onClick={pauseGame}
              className="p-2 border border-primary/50 hover:border-primary text-primary transition-colors"
              aria-label="Pause"
            >
              <Pause className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 border border-primary/50 hover:border-primary text-primary transition-colors"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Best</p>
          <p className="font-pixel text-xl neon-text-pink">{highScore}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        <GameBoard
          boardSize={boardSize}
          snake={snake}
          food={food}
        />
        <GameOverlay
          gameState={gameState}
          score={score}
          highScore={highScore}
          onStart={startGame}
          onResume={resumeGame}
          onReset={resetGame}
        />
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden">
        <GameControls
          onDirectionChange={changeDirection}
          disabled={gameState !== 'playing'}
        />
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Arrow keys or WASD to move</p>
        <p>Space to pause • ESC to menu</p>
        <p className={cn(
          'font-medium',
          mode === 'walls' ? 'text-primary' : 'text-secondary'
        )}>
          Mode: {mode === 'walls' ? 'Hit walls = Game Over' : 'Walls wrap around'}
        </p>
      </div>
    </div>
  );
}
