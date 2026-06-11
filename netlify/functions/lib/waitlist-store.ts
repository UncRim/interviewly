import { getStore } from '@netlify/blobs';

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

interface WaitlistData {
  entries: WaitlistEntry[];
}

const STORE_NAME = 'interviewly-waitlist';
const DATA_KEY = 'entries';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getTotalSpots = (): number => {
  const configured = Number(process.env.WAITLIST_TOTAL_SPOTS);
  return Number.isFinite(configured) && configured > 0 ? configured : 371;
};

const getStoreInstance = () =>
  getStore({
    name: STORE_NAME,
    consistency: 'strong',
  });

const readEntries = async (): Promise<WaitlistEntry[]> => {
  const store = getStoreInstance();
  const data = await store.get(DATA_KEY, { type: 'json' }) as WaitlistData | null;
  return Array.isArray(data?.entries) ? data.entries : [];
};

const writeEntries = async (entries: WaitlistEntry[]) => {
  const store = getStoreInstance();
  await store.setJSON(DATA_KEY, { entries });
};

export const getSpotsLeft = async (): Promise<number> => {
  const entries = await readEntries();
  return Math.max(0, getTotalSpots() - entries.length);
};

export type JoinWaitlistError = 'duplicate' | 'full' | 'invalid';

export const joinWaitlist = async (
  name: string,
  email: string
): Promise<
  | { success: true; entry: WaitlistEntry; spotsLeft: number }
  | { success: false; error: JoinWaitlistError }
> => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !EMAIL_PATTERN.test(trimmedEmail)) {
    return { success: false, error: 'invalid' };
  }

  const entries = await readEntries();
  const totalSpots = getTotalSpots();

  if (entries.length >= totalSpots) {
    return { success: false, error: 'full' };
  }

  if (entries.some((entry) => entry.email.toLowerCase() === trimmedEmail)) {
    return { success: false, error: 'duplicate' };
  }

  const entry: WaitlistEntry = {
    id: crypto.randomUUID(),
    name: trimmedName,
    email: trimmedEmail,
    joinedAt: new Date().toISOString(),
  };

  await writeEntries([...entries, entry]);

  return {
    success: true,
    entry,
    spotsLeft: Math.max(0, totalSpots - (entries.length + 1)),
  };
};
