import type {
  User,
  LeaderboardEntry,
  LivePlayer,
  AuthCredentials,
  ApiResponse,
  GameMode,
  Position,
  Direction,
} from '@/types';

const API_URL = 'http://localhost:8000';

// Helper for making API requests
async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    return { success: false, error: 'Network error' };
  }
}

// Generate AI snake movement for live players (Client-side simulation)
function generateAIMovement(snake: Position[], food: Position, direction: Direction, boardSize: number): Direction {
  const head = snake[0];
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const opposite: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };

  // Remove opposite direction
  const validDirections = directions.filter(d => d !== opposite[direction]);

  // 70% chance to move towards food
  if (Math.random() < 0.7) {
    const dx = food.x - head.x;
    const dy = food.y - head.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && validDirections.includes('RIGHT')) return 'RIGHT';
      if (dx < 0 && validDirections.includes('LEFT')) return 'LEFT';
    } else {
      if (dy > 0 && validDirections.includes('DOWN')) return 'DOWN';
      if (dy < 0 && validDirections.includes('UP')) return 'UP';
    }
  }

  // Random valid direction
  return validDirections[Math.floor(Math.random() * validDirections.length)];
}

// Re-implementing simulateMovement as a pure function to be exported separately or attached to api
export const simulateMovementPure = (player: LivePlayer, boardSize: number = 20): LivePlayer => {
  const newDirection = generateAIMovement(player.snake, player.food, player.direction, boardSize);
  const newPlayer = { ...player, direction: newDirection };

  // Calculate new head position
  const head = { ...newPlayer.snake[0] };
  switch (newDirection) {
    case 'UP': head.y -= 1; break;
    case 'DOWN': head.y += 1; break;
    case 'LEFT': head.x -= 1; break;
    case 'RIGHT': head.x += 1; break;
  }

  // Handle wrapping for pass-through mode
  if (newPlayer.mode === 'pass-through') {
    if (head.x < 0) head.x = boardSize - 1;
    if (head.x >= boardSize) head.x = 0;
    if (head.y < 0) head.y = boardSize - 1;
    if (head.y >= boardSize) head.y = 0;
  } else {
    // Walls mode - reset if hit wall
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
      newPlayer.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      newPlayer.score = 0;
      newPlayer.direction = 'RIGHT';
      return newPlayer;
    }
  }

  // Move snake
  const newSnake = [head, ...newPlayer.snake];

  // Check if food eaten
  if (head.x === newPlayer.food.x && head.y === newPlayer.food.y) {
    newPlayer.score += 10;
    newPlayer.food = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } else {
    newSnake.pop();
  }

  newPlayer.snake = newSnake;
  return newPlayer;
}

// API Service
export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      return request<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      return request<User>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    async logout(): Promise<ApiResponse<null>> {
      return request<null>('/auth/logout', {
        method: 'POST',
      });
    },

    async getCurrentUser(): Promise<ApiResponse<User | null>> {
      return request<User | null>('/auth/me');
    },
  },

  // Leaderboard endpoints
  leaderboard: {
    async getAll(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
      const query = mode ? `?mode=${mode}` : '';
      return request<LeaderboardEntry[]>(`/leaderboard${query}`);
    },

    async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
      return request<LeaderboardEntry>('/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ score, mode }),
      });
    },
  },

  // Live players endpoints
  live: {
    async getActivePlayers(): Promise<ApiResponse<LivePlayer[]>> {
      return request<LivePlayer[]>('/live/players');
    },

    async getPlayerStream(playerId: string): Promise<ApiResponse<LivePlayer | null>> {
      return request<LivePlayer | null>(`/live/players/${playerId}`);
    },

    // Simulate AI movement for a player (Client-side only)
    simulateMovement(player: LivePlayer, boardSize: number = 20): LivePlayer | null {
      return simulateMovementPure(player, boardSize);
    },
  },
};

export default api;
