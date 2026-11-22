import { getDimBacklight } from "./settings";
import { readStored, writeStored } from "./storage";

const SAVED_KEY = "deck-saver-decky:savedBrightness";
const DIMMED = 0;
const DIMMED_TOLERANCE = 0.01;

let currentBrightness: number | null = null;
let savedBrightness: number | null = null;
let unregister: (() => void) | null = null;

export function trackBrightness(): void {
  // left over from a crash, restore once we know the current level
  savedBrightness = readStored<number>(SAVED_KEY);
  let recovering = savedBrightness !== null;

  const registration = SteamClient.System.Display.RegisterForBrightnessChanges((state) => {
    currentBrightness = state.flBrightness;
    if (recovering) {
      recovering = false;
      restoreBacklight();
    }
  });
  unregister = () => registration.unregister();
}

export function untrackBrightness(): void {
  restoreBacklight();
  unregister?.();
  unregister = null;
}

export function dimBacklight(): void {
  if (!getDimBacklight() || savedBrightness !== null || currentBrightness === null) return;
  savedBrightness = currentBrightness;
  writeStored(SAVED_KEY, savedBrightness);
  currentBrightness = DIMMED;
  SteamClient.System.Display.SetBrightness(DIMMED);
}

export function restoreBacklight(): void {
  if (savedBrightness === null) return;
  // user picked a new level while dimmed, keep it
  const stillDimmed =
    currentBrightness !== null && Math.abs(currentBrightness - DIMMED) <= DIMMED_TOLERANCE;
  if (stillDimmed) SteamClient.System.Display.SetBrightness(savedBrightness);
  savedBrightness = null;
  writeStored(SAVED_KEY, null);
}
