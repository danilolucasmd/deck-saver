const DIM_KEY = "deck-saver:dimBacklight";
const PREVENT_SLEEP_KEY = "deck-saver:preventSleep";

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

export const getDimBacklight = () => readFlag(DIM_KEY);
export const setDimBacklight = (value: boolean) => writeFlag(DIM_KEY, value);
export const getPreventSleep = () => readFlag(PREVENT_SLEEP_KEY);
export const setPreventSleep = (value: boolean) => writeFlag(PREVENT_SLEEP_KEY, value);
