import { describe, it, expect } from 'vitest';
import { gameLogic } from '@/hooks/useSnakeGame';

const { generateFood, checkCollision, wrapPosition } = gameLogic;

describe('Snake Game Logic', () => {
  describe('generateFood', () => {
    it('should generate food within board bounds', () => {
      const snake = [{ x: 10, y: 10 }];
      const boardSize = 20;
      
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake, boardSize);
        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(boardSize);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(boardSize);
      }
    });

    it('should not generate food on snake position', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      const boardSize = 20;
      
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake, boardSize);
        const isOnSnake = snake.some(
          segment => segment.x === food.x && segment.y === food.y
        );
        expect(isOnSnake).toBe(false);
      }
    });
  });

  describe('checkCollision', () => {
    it('should detect self collision', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 },
        { x: 10, y: 10 }, // collision with head
      ];
      const head = { x: 10, y: 10 };
      
      expect(checkCollision(head, snake, 20, 'walls')).toBe(true);
      expect(checkCollision(head, snake, 20, 'pass-through')).toBe(true);
    });

    it('should not detect collision with adjacent body parts', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      const head = { x: 10, y: 10 };
      
      expect(checkCollision(head, snake, 20, 'walls')).toBe(false);
    });

    it('should detect wall collision in walls mode', () => {
      const snake = [{ x: 0, y: 0 }];
      const boardSize = 20;
      
      // Left wall
      expect(checkCollision({ x: -1, y: 5 }, snake, boardSize, 'walls')).toBe(true);
      // Right wall
      expect(checkCollision({ x: 20, y: 5 }, snake, boardSize, 'walls')).toBe(true);
      // Top wall
      expect(checkCollision({ x: 5, y: -1 }, snake, boardSize, 'walls')).toBe(true);
      // Bottom wall
      expect(checkCollision({ x: 5, y: 20 }, snake, boardSize, 'walls')).toBe(true);
    });

    it('should not detect wall collision in pass-through mode', () => {
      const snake = [{ x: 0, y: 0 }];
      const boardSize = 20;
      
      expect(checkCollision({ x: -1, y: 5 }, snake, boardSize, 'pass-through')).toBe(false);
      expect(checkCollision({ x: 20, y: 5 }, snake, boardSize, 'pass-through')).toBe(false);
      expect(checkCollision({ x: 5, y: -1 }, snake, boardSize, 'pass-through')).toBe(false);
      expect(checkCollision({ x: 5, y: 20 }, snake, boardSize, 'pass-through')).toBe(false);
    });
  });

  describe('wrapPosition', () => {
    it('should wrap position when going past right edge', () => {
      const pos = { x: 20, y: 10 };
      const wrapped = wrapPosition(pos, 20);
      expect(wrapped.x).toBe(0);
      expect(wrapped.y).toBe(10);
    });

    it('should wrap position when going past left edge', () => {
      const pos = { x: -1, y: 10 };
      const wrapped = wrapPosition(pos, 20);
      expect(wrapped.x).toBe(19);
      expect(wrapped.y).toBe(10);
    });

    it('should wrap position when going past bottom edge', () => {
      const pos = { x: 10, y: 20 };
      const wrapped = wrapPosition(pos, 20);
      expect(wrapped.x).toBe(10);
      expect(wrapped.y).toBe(0);
    });

    it('should wrap position when going past top edge', () => {
      const pos = { x: 10, y: -1 };
      const wrapped = wrapPosition(pos, 20);
      expect(wrapped.x).toBe(10);
      expect(wrapped.y).toBe(19);
    });

    it('should not change valid positions', () => {
      const pos = { x: 10, y: 10 };
      const wrapped = wrapPosition(pos, 20);
      expect(wrapped.x).toBe(10);
      expect(wrapped.y).toBe(10);
    });

    it('should handle corner wrapping', () => {
      const pos = { x: -1, y: -1 };
      const wrapped = wrapPosition(pos, 20);
      expect(wrapped.x).toBe(19);
      expect(wrapped.y).toBe(19);
    });
  });
});

describe('API Mock Service', () => {
  it('should have centralized mock API', async () => {
    const { default: api } = await import('@/services/api');
    
    // Test that all endpoints exist
    expect(api.auth).toBeDefined();
    expect(api.auth.login).toBeDefined();
    expect(api.auth.signup).toBeDefined();
    expect(api.auth.logout).toBeDefined();
    expect(api.auth.getCurrentUser).toBeDefined();
    
    expect(api.leaderboard).toBeDefined();
    expect(api.leaderboard.getAll).toBeDefined();
    expect(api.leaderboard.submitScore).toBeDefined();
    
    expect(api.live).toBeDefined();
    expect(api.live.getActivePlayers).toBeDefined();
    expect(api.live.getPlayerStream).toBeDefined();
    expect(api.live.simulateMovement).toBeDefined();
  });

  it('should return leaderboard entries', async () => {
    const { default: api } = await import('@/services/api');
    const response = await api.leaderboard.getAll();
    
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data!.length).toBeGreaterThan(0);
    
    const entry = response.data![0];
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('rank');
    expect(entry).toHaveProperty('username');
    expect(entry).toHaveProperty('score');
    expect(entry).toHaveProperty('mode');
  });

  it('should filter leaderboard by mode', async () => {
    const { default: api } = await import('@/services/api');
    
    const wallsResponse = await api.leaderboard.getAll('walls');
    expect(wallsResponse.success).toBe(true);
    expect(wallsResponse.data!.every(e => e.mode === 'walls')).toBe(true);
    
    const passResponse = await api.leaderboard.getAll('pass-through');
    expect(passResponse.success).toBe(true);
    expect(passResponse.data!.every(e => e.mode === 'pass-through')).toBe(true);
  });

  it('should return live players', async () => {
    const { default: api } = await import('@/services/api');
    const response = await api.live.getActivePlayers();
    
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    
    if (response.data!.length > 0) {
      const player = response.data![0];
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('username');
      expect(player).toHaveProperty('score');
      expect(player).toHaveProperty('snake');
      expect(player).toHaveProperty('food');
      expect(player).toHaveProperty('direction');
      expect(player).toHaveProperty('viewers');
    }
  });
});
