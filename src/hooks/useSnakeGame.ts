import { useState, useCallback, useEffect, useRef } from 'react';
import type { Position, Direction, GameMode, GameState, SnakeGameState, GameConfig } from '@/types';

const DEFAULT_CONFIG: GameConfig = {
  boardSize: 20,
  initialSpeed: 150,
  speedIncrement: 5,
  mode: 'walls',
};

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

function generateFood(snake: Position[], boardSize: number): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
}

function checkCollision(head: Position, snake: Position[], boardSize: number, mode: GameMode): boolean {
  // Self collision (skip head)
  if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
    return true;
  }

  // Wall collision (only in walls mode)
  if (mode === 'walls') {
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
      return true;
    }
  }

  return false;
}

function wrapPosition(pos: Position, boardSize: number): Position {
  return {
    x: ((pos.x % boardSize) + boardSize) % boardSize,
    y: ((pos.y % boardSize) + boardSize) % boardSize,
  };
}

export function useSnakeGame(config: Partial<GameConfig> = {}) {
  const gameConfig = { ...DEFAULT_CONFIG, ...config };
  const { boardSize, initialSpeed, speedIncrement, mode } = gameConfig;

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(() => generateFood(INITIAL_SNAKE, boardSize));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(`snake_highscore_${mode}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameState, setGameState] = useState<GameState>('idle');
  const [speed, setSpeed] = useState(initialSpeed);

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<number | null>(null);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const head = { ...currentSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Wrap position in pass-through mode
      const wrappedHead = mode === 'pass-through' ? wrapPosition(head, boardSize) : head;

      // Check collision
      if (checkCollision(wrappedHead, currentSnake, boardSize, mode)) {
        setGameState('game-over');
        return currentSnake;
      }

      const newSnake = [wrappedHead, ...currentSnake];

      // Check if food eaten
      setFood(currentFood => {
        if (wrappedHead.x === currentFood.x && wrappedHead.y === currentFood.y) {
          setScore(s => {
            const newScore = s + 10;
            setHighScore(hs => {
              if (newScore > hs) {
                localStorage.setItem(`snake_highscore_${mode}`, String(newScore));
                return newScore;
              }
              return hs;
            });
            return newScore;
          });
          setSpeed(s => Math.max(50, s - speedIncrement));
          return generateFood(newSnake, boardSize);
        }
        newSnake.pop();
        return currentFood;
      });

      return newSnake;
    });
  }, [boardSize, mode, speedIncrement]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = window.setInterval(moveSnake, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, speed, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const keyDirectionMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      const newDirection = keyDirectionMap[e.key];
      if (!newDirection) return;

      e.preventDefault();

      // Prevent 180-degree turns
      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };

      if (opposites[newDirection] !== directionRef.current) {
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const startGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE, boardSize));
    setDirection('RIGHT');
    setScore(0);
    setSpeed(initialSpeed);
    setGameState('playing');
  }, [boardSize, initialSpeed]);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE, boardSize));
    setDirection('RIGHT');
    setScore(0);
    setSpeed(initialSpeed);
    setGameState('idle');
  }, [boardSize, initialSpeed]);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameState !== 'playing') return;

    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== directionRef.current) {
      setDirection(newDirection);
    }
  }, [gameState]);

  const state: SnakeGameState = {
    snake,
    food,
    direction,
    score,
    highScore,
    gameState,
    speed,
  };

  return {
    ...state,
    boardSize,
    mode,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    changeDirection,
  };
}

// Export pure functions for testing
export const gameLogic = {
  generateFood,
  checkCollision,
  wrapPosition,
};
