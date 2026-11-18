// Save migrations. Any change to the SaveData shape bumps SCHEMA_VERSION and
// adds one step here; an old save is never read without migrating it.

export const SCHEMA_VERSION = 2;

/** MIGRATIONS[n] turns a version-n save into a version-(n+1) save. */
export type Migrations = Record<
  number,
  (save: Record<string, unknown>) => Record<string, unknown>
>;

const MIGRATIONS: Migrations = {
  // 2 adds the music switch, on, like a fresh profile.
  1: (save) => ({
    ...save,
    options: { ...(save.options as object), music: true },
    schemaVersion: 2,
  }),
};

/**
 * Runs every step from the save's version up to `target`. Returns undefined
 * for anything that is not a versioned save, or is newer than `target`.
 */
export function migrate(
  raw: unknown,
  migrations: Migrations = MIGRATIONS,
  target: number = SCHEMA_VERSION,
): unknown {
  if (typeof raw !== 'object' || raw === null) return undefined;
  let save = raw as Record<string, unknown>;
  while (
    typeof save.schemaVersion === 'number' &&
    save.schemaVersion < target
  ) {
    const step = migrations[save.schemaVersion];
    if (!step) return undefined;
    save = step(save);
  }
  return save.schemaVersion === target ? save : undefined;
}
