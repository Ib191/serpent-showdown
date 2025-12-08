import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch for API tests
global.fetch = vi.fn((url: string | URL | Request) => {
    const urlString = typeof url === 'string' ? url : url.toString();

    // Mock leaderboard endpoint
    if (urlString.includes('/leaderboard')) {
        const mode = urlString.includes('mode=walls') ? 'walls' :
            urlString.includes('mode=pass-through') ? 'pass-through' : null;

        const mockData = [
            { id: '1', rank: 1, username: 'player1', score: 100, mode: mode || 'walls', created_at: new Date().toISOString() },
            { id: '2', rank: 2, username: 'player2', score: 90, mode: mode || 'walls', created_at: new Date().toISOString() },
        ].filter(entry => !mode || entry.mode === mode);

        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockData }),
        } as Response);
    }

    // Mock live players endpoint
    if (urlString.includes('/live/players')) {
        const mockData = [
            {
                id: '1',
                username: 'ai_player1',
                score: 50,
                snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
                food: { x: 15, y: 15 },
                direction: 'RIGHT' as const,
                mode: 'walls' as const,
                viewers: 5,
            },
        ];

        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockData }),
        } as Response);
    }

    // Default mock response
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: null }),
    } as Response);
}) as any;
