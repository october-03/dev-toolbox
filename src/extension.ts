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

  context.subscriptions.push(disposable, generatePasswordDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  // Nothing to clean up: all disposables are registered on context.subscriptions
}
