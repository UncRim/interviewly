import type { Config } from '@netlify/functions';
import { joinWaitlist } from './lib/waitlist-store';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json() as { name?: string; email?: string };
    const result = await joinWaitlist(body.name ?? '', body.email ?? '');

    if (result.success === false) {
      const status =
        result.error === 'invalid' ? 400 :
        result.error === 'duplicate' ? 409 :
        403;

      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        spotsLeft: result.spotsLeft,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('waitlist-join error:', error);
    return new Response(JSON.stringify({ error: 'Failed to join waitlist.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config: Config = {
  path: '/api/waitlist/join',
};
