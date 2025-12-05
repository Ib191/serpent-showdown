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

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage
let currentUser: User | null = null;
const users: Map<string, User & { password: string }> = new Map();

// Initialize some mock users
users.set('player1@example.com', {
  id: '1',
  username: 'PixelMaster',
  email: 'player1@example.com',
  password: 'password123',
  createdAt: '2024-01-15',
});
users.set('player2@example.com', {
  id: '2',
  username: 'SnakeKing',
  email: 'player2@example.com',
  password: 'password123',
  createdAt: '2024-02-20',
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'PixelMaster', score: 2450, mode: 'walls', date: '2024-12-01' },
  { id: '2', rank: 2, username: 'SnakeKing', score: 2120, mode: 'pass-through', date: '2024-12-02' },
  { id: '3', rank: 3, username: 'RetroGamer', score: 1890, mode: 'walls', date: '2024-11-28' },
  { id: '4', rank: 4, username: 'NeonHunter', score: 1750, mode: 'pass-through', date: '2024-11-30' },
  { id: '5', rank: 5, username: 'ArcadeWizard', score: 1620, mode: 'walls', date: '2024-12-01' },
  { id: '6', rank: 6, username: 'ByteCrusher', score: 1480, mode: 'pass-through', date: '2024-11-25' },
  { id: '7', rank: 7, username: 'GlitchMaster', score: 1350, mode: 'walls', date: '2024-11-29' },
  { id: '8', rank: 8, username: 'PixelPunk', score: 1200, mode: 'pass-through', date: '2024-12-02' },
  { id: '9', rank: 9, username: 'CyberSnake', score: 1050, mode: 'walls', date: '2024-11-27' },
  { id: '10', rank: 10, username: 'DataViper', score: 980, mode: 'pass-through', date: '2024-11-26' },
];

// Generate AI snake movement for live players
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

// Mock live players with AI movement
let livePlayers: LivePlayer[] = [
  {
    id: 'live1',
    username: 'AIPlayer_Alpha',
    score: 150,
    mode: 'walls',
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 12 },
    direction: 'RIGHT',
    viewers: 23,
  },
  {
    id: 'live2',
    username: 'AIPlayer_Beta',
    score: 280,
    mode: 'pass-through',
    snake: [{ x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }],
    food: { x: 12, y: 8 },
    direction: 'DOWN',
    viewers: 45,
  },
  {
    id: 'live3',
    username: 'AIPlayer_Gamma',
    score: 95,
    mode: 'walls',
    snake: [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }],
    food: { x: 3, y: 18 },
    direction: 'LEFT',
    viewers: 12,
  },
];

// API Service
export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      await delay(500);
      const user = users.get(credentials.email);
      if (user && user.password === credentials.password) {
        const { password, ...userData } = user;
        currentUser = userData;
        return { success: true, data: userData };
      }
      return { success: false, error: 'Invalid email or password' };
    },

    async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      await delay(500);
      if (users.has(credentials.email)) {
        return { success: false, error: 'Email already registered' };
      }
      if (!credentials.username) {
        return { success: false, error: 'Username is required' };
      }
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        createdAt: new Date().toISOString(),
      };
      users.set(credentials.email, newUser);
      const { password, ...userData } = newUser;
      currentUser = userData;
      return { success: true, data: userData };
    },

    async logout(): Promise<ApiResponse<null>> {
      await delay(200);
      currentUser = null;
      return { success: true };
    },

    async getCurrentUser(): Promise<ApiResponse<User | null>> {
      await delay(100);
      return { success: true, data: currentUser };
    },
  },

  // Leaderboard endpoints
  leaderboard: {
    async getAll(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
      await delay(300);
      let entries = [...mockLeaderboard];
      if (mode) {
        entries = entries.filter(e => e.mode === mode);
      }
      return { success: true, data: entries };
    },

    async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
      await delay(400);
      if (!currentUser) {
        return { success: false, error: 'Must be logged in to submit score' };
      }
      const entry: LeaderboardEntry = {
        id: `score_${Date.now()}`,
        rank: 0,
        username: currentUser.username,
        score,
        mode,
        date: new Date().toISOString().split('T')[0],
      };
      mockLeaderboard.push(entry);
      mockLeaderboard.sort((a, b) => b.score - a.score);
      mockLeaderboard.forEach((e, i) => (e.rank = i + 1));
      entry.rank = mockLeaderboard.findIndex(e => e.id === entry.id) + 1;
      return { success: true, data: entry };
    },
  },

  // Live players endpoints
  live: {
    async getActivePlayers(): Promise<ApiResponse<LivePlayer[]>> {
      await delay(200);
      return { success: true, data: livePlayers };
    },

    async getPlayerStream(playerId: string): Promise<ApiResponse<LivePlayer | null>> {
      await delay(100);
      const player = livePlayers.find(p => p.id === playerId);
      return { success: true, data: player || null };
    },

    // Simulate AI movement for a player
    simulateMovement(playerId: string, boardSize: number = 20): LivePlayer | null {
      const playerIndex = livePlayers.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return null;

      const player = { ...livePlayers[playerIndex] };
      const newDirection = generateAIMovement(player.snake, player.food, player.direction, boardSize);
      player.direction = newDirection;

      // Calculate new head position
      const head = { ...player.snake[0] };
      switch (newDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Handle wrapping for pass-through mode
      if (player.mode === 'pass-through') {
        if (head.x < 0) head.x = boardSize - 1;
        if (head.x >= boardSize) head.x = 0;
        if (head.y < 0) head.y = boardSize - 1;
        if (head.y >= boardSize) head.y = 0;
      } else {
        // Walls mode - reset if hit wall
        if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
          player.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
          player.score = 0;
          player.direction = 'RIGHT';
          livePlayers[playerIndex] = player;
          return player;
        }
      }

      // Move snake
      const newSnake = [head, ...player.snake];
      
      // Check if food eaten
      if (head.x === player.food.x && head.y === player.food.y) {
        player.score += 10;
        player.food = {
          x: Math.floor(Math.random() * boardSize),
          y: Math.floor(Math.random() * boardSize),
        };
      } else {
        newSnake.pop();
      }

      player.snake = newSnake;
      livePlayers[playerIndex] = player;
      return player;
    },
  },
};

export default api;
