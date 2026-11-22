import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  ToggleField,
  staticClasses,
} from "@decky/ui";
import { definePlugin, routerHook } from "@decky/api";
import { useState } from "react";
import { FaMoon } from "react-icons/fa";
import { trackBrightness, untrackBrightness } from "./backlight";
import { BLACK_SCREEN_ROUTE, BlackScreen, startBlackScreen } from "./blackScreen";
import { startScreensaver, stopScreensaverWatch } from "./screensaver";
import { getDimBacklight, getPreventSleep, setDimBacklight, setPreventSleep } from "./settings";
import { allowSleep } from "./sleep";

function Content() {
  const [dim, setDim] = useState(getDimBacklight);
  const [noSleep, setNoSleep] = useState(getPreventSleep);

  return (
    <>
      <PanelSection title="Start">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={startScreensaver}
            description="Shows the screensaver selected in Steam's settings."
          >
            Screensaver
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={startBlackScreen}
            description="Turns every pixel black. On OLED this switches them off."
          >
            Black screen
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <ToggleField
            label="Dim backlight"
            description="Lowers brightness while either mode is active and restores it on wake."
            checked={dim}
            onChange={(value) => {
              setDim(value);
              setDimBacklight(value);
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label="Prevent sleep"
            description="Pauses Steam's sleep timer while either mode is active and restores it on wake."
            checked={noSleep}
            onChange={(value) => {
              setNoSleep(value);
              setPreventSleep(value);
            }}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

export default definePlugin(() => {
  trackBrightness();
  // in case a crash left the sleep timers at never
  allowSleep();
  routerHook.addRoute(BLACK_SCREEN_ROUTE, BlackScreen, { exact: true });

  return {
    name: "DeckSaver",
    titleView: <div className={staticClasses.Title}>DeckSaver</div>,
    content: <Content />,
    icon: <FaMoon />,
    onDismount() {
      stopScreensaverWatch();
      untrackBrightness();
      allowSleep();
      routerHook.removeRoute(BLACK_SCREEN_ROUTE);
    },
  };
});
