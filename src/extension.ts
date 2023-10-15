import * as vscode from 'vscode';
import './finder/index';
import { WhereAreMyUtils } from './view/WebviewProvider';

export async function activate(context: vscode.ExtensionContext) {
  // Get the TS extension+

  const provider = new WhereAreMyUtils(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(WhereAreMyUtils.viewType, provider)
  );

  provider._view?.webview.postMessage({ type: 'DIRNAME', payload: __dirname });

  // Create a file system watcher
  // const watcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);

  // Subscribe to create, change, and delete events
  // watcher.onDidCreate(uri => {
  //   provider.sendExportedFunctions();
  // });

  // watcher.onDidChange(uri => {
  //   provider.sendExportedFunctions();
  // });

  // watcher.onDidDelete(uri => {
  //   provider.sendExportedFunctions();
  //   // vscode.window.showInformationMessage(`A  was deleted: ${uri.fsPath}`);
  // });

  // context.subscriptions.push(watcher);
}

export function deactivate() {}
