import type { GameState } from '@/types';
import { cn } from '@/lib/utils';

interface GameOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  onStart: () => void;
  onResume: () => void;
  onReset: () => void;
}

export default function GameOverlay({
  gameState,
  score,
  highScore,
  onStart,
  onResume,
  onReset,
}: GameOverlayProps) {
  if (gameState === 'playing') return null;

  const buttonClass = cn(
    'btn-arcade bg-primary text-primary-foreground border-primary',
    'hover:bg-primary/90 neon-border'
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
      <div className="text-center space-y-6">
        {gameState === 'idle' && (
          <>
            <h2 className="font-pixel text-2xl neon-text">SNAKE</h2>
            <p className="text-muted-foreground text-sm">
              Use arrow keys or WASD to move
            </p>
            <button onClick={onStart} className={buttonClass}>
              Start Game
            </button>
          </>
        )}

        {gameState === 'paused' && (
          <>
            <h2 className="font-pixel text-xl neon-text-cyan">PAUSED</h2>
            <div className="space-y-3">
              <button onClick={onResume} className={buttonClass}>
                Resume
              </button>
              <button
                onClick={onReset}
                className={cn(
                  'btn-arcade bg-transparent text-destructive border-destructive',
                  'hover:bg-destructive hover:text-destructive-foreground'
                )}
              >
                Quit
              </button>
            </div>
          </>
        )}

        {gameState === 'game-over' && (
          <>
            <h2 className="font-pixel text-xl text-destructive">GAME OVER</h2>
            <div className="space-y-2">
              <p className="font-pixel text-lg neon-text-pink">
                Score: {score}
              </p>
              {score >= highScore && score > 0 && (
                <p className="font-pixel text-sm text-neon-yellow animate-pulse">
                  NEW HIGH SCORE!
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                Best: {highScore}
              </p>
            </div>
            <button onClick={onStart} className={buttonClass}>
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
