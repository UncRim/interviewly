import type { Config } from '@netlify/functions';
import { getSpotsLeft, getTotalSpots } from './lib/waitlist-store';

export default async () => {
  try {
    const spotsLeft = await getSpotsLeft();

    return new Response(
      JSON.stringify({
        spotsLeft,
        totalSpots: getTotalSpots(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('waitlist-stats error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load waitlist stats.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config: Config = {
  path: '/api/waitlist/stats',
};
