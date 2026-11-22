import { Focusable, Navigation } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { beginSaver, endSaver } from "./session";

export const BLACK_SCREEN_ROUTE = "/deck-saver/black";

// so releasing the button that opened it doesn't wake it
const ARM_DELAY_MS = 600;

export function startBlackScreen(): void {
  Navigation.CloseSideMenus();
  Navigation.Navigate(BLACK_SCREEN_ROUTE);
}

// missing from @decky/ui types
type SteamInput = typeof SteamClient.Input & {
  EnableControllerAnalogInputMessages?: (enabled: boolean) => void;
};

function listenForWakeInput(onWake: () => void): () => void {
  const input: SteamInput = SteamClient.Input;
  const armedAt = Date.now() + ARM_DELAY_MS;
  const wakeIfArmed = () => {
    if (Date.now() >= armedAt) onWake();
  };

  const registrations = [
    input.RegisterForControllerInputMessages?.((_index, _button, pressed) => {
      if (pressed) wakeIfArmed();
    }),
    // sticks, triggers, trackpads
    input.RegisterForControllerAnalogInputMessages?.(wakeIfArmed),
  ];
  input.EnableControllerAnalogInputMessages?.(true);

  return () => {
    input.EnableControllerAnalogInputMessages?.(false);
    registrations.forEach((registration) => registration?.unregister());
  };
}

export function BlackScreen() {
  const mounted = useRef(true);
  const dismissed = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [windowBody, setWindowBody] = useState<HTMLElement | null>(null);

  const dismiss = (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (dismissed.current || !mounted.current) return;
    dismissed.current = true;
    Navigation.NavigateBack();
  };

  useEffect(() => {
    beginSaver();
    rootRef.current?.focus();
    // portal to body, otherwise steam's header/footer render on top
    setWindowBody(rootRef.current?.ownerDocument.body ?? null);
    const stopListening = listenForWakeInput(dismiss);

    return () => {
      mounted.current = false;
      stopListening();
      endSaver();
    };
  }, []);

  return (
    <Focusable
      ref={rootRef}
      noFocusRing
      onActivate={dismiss}
      onCancel={dismiss}
      onButtonDown={dismiss}
      onGamepadDirection={dismiss}
    >
      {windowBody &&
        createPortal(
          <div
            onPointerDown={() => dismiss()}
            onTouchStart={() => dismiss()}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483647,
              background: "#000",
              cursor: "none",
            }}
          />,
          windowBody,
        )}
    </Focusable>
  );
}
