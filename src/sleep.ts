import { getPreventSleep } from "./settings";
import { readStored, writeStored } from "./storage";

const SAVED_KEY = "deck-saver:savedIdleSuspend";
const IDLE_SUSPEND_SETTINGS = ["system_idle_suspend_battery_sec", "system_idle_suspend_ac_sec"];
const NEVER = 0;

type SavedTimers = Record<string, number>;

interface SettingsStore {
  GetClientSetting(name: string): [unknown, (value: unknown) => void];
}

function getSettingsStore(): SettingsStore | null {
  const store = (window as any).settingsStore;
  return typeof store?.GetClientSetting === "function" ? store : null;
}

let saved: SavedTimers | null = null;

export function preventSleep(): void {
  const store = getSettingsStore();
  if (!getPreventSleep() || !store || saved) return;

  const timers: SavedTimers = {};
  for (const name of IDLE_SUSPEND_SETTINGS) {
    const [value] = store.GetClientSetting(name);
    if (typeof value === "number") timers[name] = value;
  }
  saved = timers;
  writeStored(SAVED_KEY, timers);
  for (const name of Object.keys(timers)) store.GetClientSetting(name)[1](NEVER);
}

export function allowSleep(): void {
  const store = getSettingsStore();
  const timers = saved ?? readStored<SavedTimers>(SAVED_KEY);
  if (!store || !timers) return;

  for (const [name, value] of Object.entries(timers)) {
    const [current, set] = store.GetClientSetting(name);
    // user changed it in the meantime, leave it
    if (current === NEVER) set(value);
  }
  saved = null;
  writeStored(SAVED_KEY, null);
}
