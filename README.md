# Dev Toolbox

A collection of handy utilities for developers, bundled into a single VS Code extension.

Instead of installing a dozen single-purpose extensions, Dev Toolbox gathers the small tools you keep reaching for into
one place — and anyone is welcome to add the one that's missing.

> **Status:** early development. Dev Toolbox is not published to the VS Code Marketplace yet, and only a handful of
> utilities have shipped so far. This is a great time to shape what goes in — see [Contributing](#contributing).

## Utilities

Every command is available from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) under the `Dev Toolbox:` prefix.

| Utility            | Command ID                     | Description                                                                                                                        |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Password Generator | `dev-toolbox.generatePassword` | Generates a random password of a chosen length (4–128) from upper- and lowercase letters, digits, and symbols, with a copy button. |
| JWT Decoder        | `dev-toolbox.decodeJwt`        | Decodes a JWT and opens its header, payload, and signature as formatted JSON in a read-only tab. Does not verify the signature.    |

## Requirements

- **VS Code** `^1.125.0`
- **Node.js** 24 or newer
- **pnpm** — this repository uses a pnpm lockfile and workspace

## Installation

Dev Toolbox isn't on the Marketplace yet, so install it from source:

```bash
git clone https://github.com/october-03/dev-toolbox.git
```

```bash
cd dev-toolbox && pnpm install
```

Then open the folder in VS Code and press `F5`. This launches an Extension Development Host window with Dev Toolbox
loaded, where you can try the commands from the Command Palette.

To produce a production bundle in `dist/`:

```bash
pnpm run package
```

## Contributing

**Anyone can contribute.** Whether you want to build a utility, request one, or fix a typo, you're welcome here.

### Requesting a utility

If there's a utility you need, [open an Issue](https://github.com/october-03/dev-toolbox/issues). Describe what the
utility should do and the problem it solves for you — that context helps whoever picks it up build the right thing. You
don't have to implement it yourself.

### Development setup

```bash
pnpm install
```

```bash
pnpm run watch
```

With the watcher running, press `F5` to open the Extension Development Host. Reload that window (`Cmd+R` / `Ctrl+R`)
to pick up your changes. Run the test suite with:

```bash
pnpm test
```

### Adding a new utility

1. **Register the command** in [`src/extension.ts`](src/extension.ts). Inside `activate()`, register it with
   `vscode.commands.registerCommand` and push the returned disposable onto `context.subscriptions` so it's cleaned up on
   deactivation:

   ```ts
   const disposable = vscode.commands.registerCommand("dev-toolbox.yourUtility", () => {
     // your utility here
   });

   context.subscriptions.push(disposable);
   ```

2. **Declare it in the manifest.** Add a matching entry to `contributes.commands` in
   [`package.json`](package.json). The `command` must exactly match the ID you registered, and the `title` should carry
   the `Dev Toolbox: ` prefix so it groups nicely in the Command Palette:

   ```json
   {
     "command": "dev-toolbox.yourUtility",
     "title": "Dev Toolbox: Your Utility"
   }
   ```

3. **Add a test** alongside [`src/test/extension.test.ts`](src/test/extension.test.ts).

4. **Document it** by adding a row to the [Utilities](#utilities) table above.

### Before opening a pull request

```bash
pnpm run lint && pnpm run check-types && pnpm run format
```

## Scripts

| Script                 | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `pnpm run compile`     | Type-check, lint, and build to `dist/`             |
| `pnpm run watch`       | Rebuild and type-check on every change             |
| `pnpm run package`     | Production build, minified, no source maps         |
| `pnpm run lint`        | Run ESLint over `src`                              |
| `pnpm run check-types` | Type-check with `tsc --noEmit`                     |
| `pnpm run format`      | Format the repository with Prettier                |
| `pnpm test`            | Run the extension test suite in a VS Code instance |

## License

[MIT](LICENSE)
