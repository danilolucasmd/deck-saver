import { findModuleExport, Navigation } from "@decky/ui";
import { toaster } from "@decky/api";
import { beginSaver, endSaver } from "./session";

interface ScreensaverService {
  ForceScreensaver(request: { enabled: boolean }): Promise<unknown>;
  GetActiveState(request: object): Promise<any>;
}

const POLL_MS = 1000;
const START_TIMEOUT_MS = 5000;
const MENU_CLOSE_DELAY_MS = 300;

let service: ScreensaverService | null | undefined;
let pollTimer: number | null = null;

function getService(): ScreensaverService | null {
  // not public, find it by shape in steam's webpack modules
  service ??=
    findModuleExport(
      (e: any) =>
        typeof e?.ForceScreensaver === "function" && typeof e?.GetActiveState === "function",
    ) ?? null;
  return service ?? null;
}

async function isActive(svc: ScreensaverService): Promise<boolean> {
  const response = await svc.GetActiveState({});
  return Boolean(response?.Body?.()?.active?.());
}

function stopWatching(): void {
  if (pollTimer !== null) clearInterval(pollTimer);
  pollTimer = null;
}

function watchUntilInactive(svc: ScreensaverService): void {
  stopWatching();
  const startedAt = Date.now();
  let seenActive = false;
  pollTimer = window.setInterval(async () => {
    let active: boolean;
    try {
      active = await isActive(svc);
    } catch {
      active = false;
      seenActive = true;
    }
    if (active) {
      seenActive = true;
      return;
    }
    if (seenActive || Date.now() - startedAt > START_TIMEOUT_MS) {
      stopWatching();
      endSaver();
    }
  }, POLL_MS);
}

export async function startScreensaver(): Promise<void> {
  const svc = getService();
  if (!svc) {
    toaster.toast({
      title: "DeckSaver",
      body: "Steam's screensaver could not be found on this SteamOS version.",
    });
    return;
  }

  Navigation.CloseSideMenus();
  await new Promise((resolve) => setTimeout(resolve, MENU_CLOSE_DELAY_MS));

  beginSaver();
  try {
    await svc.ForceScreensaver({ enabled: true });
  } catch (error) {
    endSaver();
    toaster.toast({ title: "DeckSaver", body: "Could not start Steam's screensaver." });
    console.error("DeckSaver: ForceScreensaver failed", error);
    return;
  }
  watchUntilInactive(svc);
}

export function stopScreensaverWatch(): void {
  stopWatching();
}
