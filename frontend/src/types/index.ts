export type Position = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'walls' | 'pass-through';

export type GameState = 'idle' | 'playing' | 'paused' | 'game-over';

export interface GameConfig {
  boardSize: number;
  initialSpeed: number;
  speedIncrement: number;
  mode: GameMode;
}

export interface SnakeGameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  highScore: number;
  gameState: GameState;
  speed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
}

export interface LivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  snake: Position[];
  food: Position;
  direction: Direction;
  viewers: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
