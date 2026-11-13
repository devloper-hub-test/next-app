// lib/kv-store.ts
// Tiny key-value store for online game rooms.
// - With Upstash Redis configured, rooms are shared by every server instance
//   (needed on Vercel, where "create" and "join" can run on different machines).
// - Without it, rooms live in this server's memory: fine for `yarn dev`.
import { Redis } from "@upstash/redis";

export interface KvStore<T> {
  get: (id: string) => Promise<T | undefined>;
  set: (id: string, value: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

// Accepts both Upstash's own variable names and the ones Vercel's Upstash integration sets
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export const isSharedStore = redis !== null;

const createRedisStore = <T>(client: Redis, prefix: string, ttlSeconds: number): KvStore<T> => ({
  get: async (id) => (await client.get<T>(`${prefix}:${id}`)) ?? undefined,
  set: async (id, value) => {
    // Rooms expire on their own after a while without activity
    await client.set(`${prefix}:${id}`, value, { ex: ttlSeconds });
  },
  delete: async (id) => {
    await client.del(`${prefix}:${id}`);
  },
});

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

// Kept on globalThis so every route handler shares one map and it survives dev reloads
const globalForKv = globalThis as typeof globalThis & { kvMemory?: Map<string, MemoryEntry> };
const memory = (globalForKv.kvMemory ??= new Map<string, MemoryEntry>());

const createMemoryStore = <T>(prefix: string, ttlSeconds: number): KvStore<T> => ({
  get: (id) => {
    const key = `${prefix}:${id}`;
    const entry = memory.get(key);
    if (entry && entry.expiresAt < Date.now()) memory.delete(key);
    return Promise.resolve(entry && entry.expiresAt >= Date.now() ? (entry.value as T) : undefined);
  },
  set: (id, value) => {
    memory.set(`${prefix}:${id}`, { value: structuredClone(value), expiresAt: Date.now() + ttlSeconds * 1000 });
    return Promise.resolve();
  },
  delete: (id) => {
    memory.delete(`${prefix}:${id}`);
    return Promise.resolve();
  },
});

export const createKvStore = <T>(prefix: string, ttlSeconds: number): KvStore<T> =>
  redis ? createRedisStore<T>(redis, prefix, ttlSeconds) : createMemoryStore<T>(prefix, ttlSeconds);
