import { memo } from 'react';
import type { Position } from '@/types';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  boardSize: number;
  snake: Position[];
  food: Position;
  cellSize?: number;
  className?: string;
}

const GameBoard = memo(function GameBoard({
  boardSize,
  snake,
  food,
  cellSize = 20,
  className,
}: GameBoardProps) {
  const boardPixelSize = boardSize * cellSize;

  // Create a set for O(1) snake position lookup
  const snakePositions = new Set(snake.map(pos => `${pos.x},${pos.y}`));
  const headPosition = `${snake[0]?.x},${snake[0]?.y}`;

  const cells = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const key = `${x},${y}`;
      const isSnake = snakePositions.has(key);
      const isHead = key === headPosition;
      const isFood = x === food.x && y === food.y;

      cells.push(
        <div
          key={key}
          className={cn(
            'game-cell absolute',
            isHead && 'snake-head',
            isSnake && !isHead && 'snake-segment',
            isFood && 'food-item'
          )}
          style={{
            left: x * cellSize + 1,
            top: y * cellSize + 1,
            width: cellSize - 2,
            height: cellSize - 2,
          }}
        />
      );
    }
  }

  return (
    <div
      className={cn(
        'relative bg-grid border-2 border-primary neon-border crt-effect',
        className
      )}
      style={{
        width: boardPixelSize,
        height: boardPixelSize,
        backgroundImage: `
          linear-gradient(to right, hsl(var(--grid-line)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--grid-line)) 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }}
    >
      {cells}
    </div>
  );
});

export default GameBoard;
