import { dimBacklight, restoreBacklight } from "./backlight";
import { allowSleep, preventSleep } from "./sleep";

export function beginSaver(): void {
  dimBacklight();
  preventSleep();
}

export function endSaver(): void {
  restoreBacklight();
  allowSleep();
}
