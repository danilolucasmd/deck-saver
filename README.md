# DeckSaver

Decky Loader plugin to start the screensaver from the Quick Access Menu instead of waiting for the idle timer.

## Features

- Screensaver: starts whatever screensaver is selected in Steam's settings.
- Black screen: fills the screen with black. On the OLED Deck the pixels are off, so no burn-in if you leave it on overnight for a download.
- Dim backlight (off by default): lowers brightness while active, restores it after.
- Prevent sleep (off by default): sets Steam's sleep timers to never while active, restores them after.

Any button, trackpad, touch, stick or trigger input wakes it.

## Building

```sh
pnpm install
pnpm build
```

## Installing

Zip `dist/`, `plugin.json`, `package.json`, `LICENSE` and `README.md` inside a `DeckSaver/` folder and install it from Decky's Developer tab.

## License

BSD 3-Clause, see [LICENSE](LICENSE).
