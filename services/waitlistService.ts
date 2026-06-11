import { WAITLIST_TOTAL_SPOTS } from '../constants';

export type JoinWaitlistError = 'duplicate' | 'full' | 'invalid' | 'network';

export type JoinWaitlistResult =
  | { success: true; spotsLeft: number }
  | { success: false; error: JoinWaitlistError };

const parseJoinError = (status: number, error?: string): JoinWaitlistError => {
  if (error === 'duplicate' || error === 'full' || error === 'invalid') {
    return error;
  }
  if (status === 409) return 'duplicate';
  if (status === 403) return 'full';
  return 'invalid';
};

export const getSpotsLeft = async (): Promise<number> => {
  try {
    const response = await fetch('/api/waitlist/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch waitlist stats');
    }

    const data = await response.json() as { spotsLeft?: number };
    return typeof data.spotsLeft === 'number' ? data.spotsLeft : WAITLIST_TOTAL_SPOTS;
  } catch {
    return WAITLIST_TOTAL_SPOTS;
  }
};

export const joinWaitlist = async (name: string, email: string): Promise<JoinWaitlistResult> => {
  try {
    const response = await fetch('/api/waitlist/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json() as {
      success?: boolean;
      spotsLeft?: number;
      error?: string;
    };

    if (!response.ok || data.success === false) {
      return {
        success: false,
        error: parseJoinError(response.status, data.error),
      };
    }

    return {
      success: true,
      spotsLeft: typeof data.spotsLeft === 'number' ? data.spotsLeft : 0,
    };
  } catch {
    return { success: false, error: 'network' };
  }
};
