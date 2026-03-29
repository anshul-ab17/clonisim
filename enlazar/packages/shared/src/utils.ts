import { randomUUID } from "crypto";

export const generateId = (): string => randomUUID();

export const now = (): string => new Date().toISOString();

export const parseJson = <T>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const slugify = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
