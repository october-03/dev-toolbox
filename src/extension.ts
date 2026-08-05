// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  DEFAULT_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  generatePassword,
  validatePasswordLength,
} from "./utils/password";
import { decodeJwt, validateJwt } from "./utils/jwt";

// Prefixed so the scheme can't collide with another extension's — registering a taken scheme throws
const JWT_DOCUMENT_SCHEME = "dev-toolbox-jwt";

// Decoded output is kept here rather than in the URI, which VS Code persists to disk and shows on tab hover
const decodedJwtDocuments = new Map<string, string>();
let decodedJwtCount = 0;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "dev-toolbox" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand("dev-toolbox.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from Dev Toolbox!");
  });

  const generatePasswordDisposable = vscode.commands.registerCommand("dev-toolbox.generatePassword", async () => {
    const input = await vscode.window.showInputBox({
      title: "Dev Toolbox: Generate Password",
      prompt: `Password length (${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH})`,
      value: String(DEFAULT_PASSWORD_LENGTH),
      validateInput: validatePasswordLength,
    });

    // undefined means the user dismissed the input box
    if (input === undefined) {
      return;
    }

    const password = generatePassword(Number(input.trim()));
    const copyAction = "Copy to Clipboard";
    const selection = await vscode.window.showInformationMessage(password, copyAction);

    if (selection === copyAction) {
      await vscode.env.clipboard.writeText(password);
    }
  });

  const jwtDocumentProviderDisposable = vscode.workspace.registerTextDocumentContentProvider(JWT_DOCUMENT_SCHEME, {
    provideTextDocumentContent: (uri) => decodedJwtDocuments.get(uri.path),
  });

  const closeDecodedJwtDisposable = vscode.workspace.onDidCloseTextDocument((document) => {
    if (document.uri.scheme === JWT_DOCUMENT_SCHEME) {
      decodedJwtDocuments.delete(document.uri.path);
    }
  });

  const decodeJwtDisposable = vscode.commands.registerCommand("dev-toolbox.decodeJwt", async () => {
    const input = await vscode.window.showInputBox({
      title: "Dev Toolbox: Decode JWT",
      prompt: "Paste a JWT",
      placeHolder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      // Pasting a token usually means switching to a browser or terminal first
      ignoreFocusOut: true,
      validateInput: validateJwt,
    });

    // undefined means the user dismissed the input box
    if (input === undefined) {
      return;
    }

    try {
      // A fresh URI per decode keeps two tokens open side by side; the .json suffix drives the language mode
      const uri = vscode.Uri.from({ scheme: JWT_DOCUMENT_SCHEME, path: `/jwt-${++decodedJwtCount}.json` });

      decodedJwtDocuments.set(uri.path, JSON.stringify(decodeJwt(input), null, 2));

      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
      await vscode.window.showErrorMessage(error instanceof Error ? error.message : "Failed to decode the JWT.");
    }
  });

  context.subscriptions.push(
    disposable,
    generatePasswordDisposable,
    decodeJwtDisposable,
    jwtDocumentProviderDisposable,
    closeDecodedJwtDisposable,
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  // Nothing to clean up: all disposables are registered on context.subscriptions
}
