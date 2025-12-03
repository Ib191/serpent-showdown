import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Direction } from '@/types';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  onDirectionChange: (direction: Direction) => void;
  disabled?: boolean;
}

export default function GameControls({ onDirectionChange, disabled }: GameControlsProps) {
  const buttonClass = cn(
    'w-14 h-14 flex items-center justify-center',
    'bg-muted border-2 border-primary text-primary',
    'hover:bg-primary hover:text-primary-foreground',
    'active:scale-95 transition-all duration-100',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'neon-border'
  );

  return (
    <div className="grid grid-cols-3 gap-2 w-fit">
      <div />
      <button
        className={buttonClass}
        onClick={() => onDirectionChange('UP')}
        disabled={disabled}
        aria-label="Move up"
      >
        <ChevronUp className="w-8 h-8" />
      </button>
      <div />
      <button
        className={buttonClass}
        onClick={() => onDirectionChange('LEFT')}
        disabled={disabled}
        aria-label="Move left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        className={buttonClass}
        onClick={() => onDirectionChange('DOWN')}
        disabled={disabled}
        aria-label="Move down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
      <button
        className={buttonClass}
        onClick={() => onDirectionChange('RIGHT')}
        disabled={disabled}
        aria-label="Move right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}
