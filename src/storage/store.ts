import { buildSeedData } from '../data/seed';
import { isAppData, SCHEMA_VERSION, type AppData } from '../data/schema';

const STORAGE_KEY = 'performance:v1';

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

export interface LoadResult {
  data: AppData;
  /** True when storage was empty/corrupt/outdated and demo data was used to initialize it. */
  seeded: boolean;
}

/**
 * Loads persisted app data. Falls back to freshly-generated demo data (seeded
 * to the real current week) when nothing is stored yet, the stored JSON is
 * corrupt, or its schemaVersion doesn't match what this build expects — the
 * MVP has a single schema version, so a mismatch just means "start fresh"
 * rather than attempting a migration.
 */
export function loadAppData(): LoadResult {
  const raw = readRaw();
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isAppData(parsed) && parsed.schemaVersion === SCHEMA_VERSION) {
        return { data: parsed, seeded: false };
      }
    } catch {
      // fall through to seed
    }
  }
  const seeded = buildSeedData();
  writeRaw(JSON.stringify(seeded));
  return { data: seeded, seeded: true };
}

export function saveAppData(data: AppData): boolean {
  return writeRaw(JSON.stringify(data));
}

export function clearAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function exportBackup(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export interface ImportResult {
  ok: boolean;
  data?: AppData;
  error?: string;
}

export function parseBackup(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Arquivo inválido: não é um JSON válido.' };
  }
  if (!isAppData(parsed)) {
    return { ok: false, error: 'Arquivo inválido: estrutura de dados não reconhecida.' };
  }
  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, error: `Versão incompatível (esperado v${SCHEMA_VERSION}, arquivo é v${parsed.schemaVersion}).` };
  }
  return { ok: true, data: parsed };
}
