import { buildSeedData } from '../data/seed';
import { migrate } from '../data/migrations';
import { isAppData, looksLikeMigratableAppData, SCHEMA_VERSION, type AppData } from '../data/schema';

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
 * Migrates a parsed-but-possibly-old blob to the current schema, if
 * possible. Returns null when it can't be trusted (corrupt shape, or a
 * schema version newer than this build knows how to read) — the caller
 * falls back to seed only in that case, never just because the version
 * differs from current.
 */
function tryMigrate(parsed: unknown): AppData | null {
  if (!looksLikeMigratableAppData(parsed)) return null;
  const migrated = migrate(parsed);
  if (isAppData(migrated) && migrated.schemaVersion === SCHEMA_VERSION) {
    return migrated;
  }
  return null;
}

/**
 * Loads persisted app data. Runs it through the migration chain when it's an
 * older-but-recognizable schema — real athlete history is never discarded
 * just because the schema evolved. Falls back to freshly-generated demo data
 * (seeded to the real current week) only when nothing is stored yet, the
 * stored JSON is corrupt, or its schema is newer than this build supports.
 */
export function loadAppData(): LoadResult {
  const raw = readRaw();
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      const migrated = tryMigrate(parsed);
      if (migrated) {
        if (migrated !== parsed) writeRaw(JSON.stringify(migrated));
        return { data: migrated, seeded: false };
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
  if (!looksLikeMigratableAppData(parsed)) {
    return { ok: false, error: 'Arquivo inválido: estrutura de dados não reconhecida.' };
  }
  const migrated = tryMigrate(parsed);
  if (!migrated) {
    const version = (parsed as { schemaVersion?: unknown }).schemaVersion;
    return { ok: false, error: `Versão incompatível (esperado até v${SCHEMA_VERSION}, arquivo é v${String(version)}).` };
  }
  return { ok: true, data: migrated };
}
