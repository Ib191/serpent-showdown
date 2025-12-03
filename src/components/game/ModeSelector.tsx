import type { GameMode } from '@/types';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ mode, onModeChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onModeChange('walls')}
        disabled={disabled}
        className={cn(
          'px-6 py-3 font-pixel text-xs uppercase tracking-wider',
          'border-2 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          mode === 'walls'
            ? 'bg-primary text-primary-foreground border-primary neon-border'
            : 'bg-transparent text-primary border-primary/50 hover:border-primary'
        )}
      >
        Walls
      </button>
      <button
        onClick={() => onModeChange('pass-through')}
        disabled={disabled}
        className={cn(
          'px-6 py-3 font-pixel text-xs uppercase tracking-wider',
          'border-2 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          mode === 'pass-through'
            ? 'bg-secondary text-secondary-foreground border-secondary neon-border-pink'
            : 'bg-transparent text-secondary border-secondary/50 hover:border-secondary'
        )}
      >
        Pass-Through
      </button>
    </div>
  );
}
