import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getFiles } from '../finder';
import { Message, MessageType, Messages } from './messages/messageTypes';

export class WhereAreMyUtils implements vscode.WebviewViewProvider {
  public static readonly viewType = 'calicoColors.colorsView';

  public _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app'))],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(_data => {
      const data = _data as Messages & { type: MessageType };
      switch (data.type) {
        case 'GO_TO_LINE': {
          const { loc, path } = data.payload;
          if (!loc) {
            return;
          }
          const fileUri = vscode.Uri.parse(path);
          vscode.workspace.openTextDocument(fileUri).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
              const position = new vscode.Position(loc.start.line - 1, loc.start.column);
              editor.selection = new vscode.Selection(position, position);
              editor.revealRange(
                new vscode.Range(position, position),
                vscode.TextEditorRevealType.InCenter
              );
            });
          });
          break;
        }
        case 'GET_FILES': {
          this.sendExportedFunctions();
          break;
        }
        // case 'GET_DIRNAME': {
        //   const rootPath = vscode.workspace.workspaceFolders?.[0].uri;
        //   if (rootPath) {
        //     this._view?.webview.postMessage({ type: 'DIRNAME', payload: rootPath.fsPath });
        //   }
        //   break;
        // }
      }
    });
  }

  public async sendExportedFunctions() {
    const files = await getFiles();
    this._view?.webview.postMessage({ type: 'FILES', payload: files });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const bundleScriptPath = webview.asWebviewUri(
      vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app', 'bundle.js'))
    );

    //  read the html file from out/app/index.html and return it as a string
    const htmlPath = vscode.Uri.file(
      path.join(this._context.extensionPath, 'out', 'app', 'index.html')
    );

    const html = fs.readFileSync(htmlPath.fsPath, 'utf8');

    return html;

    // return `<!DOCTYPE html>
    //   <html lang="en">
    //   <head>
    //     <meta charset="UTF-8">
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //     <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/vscode-codicons/dist/codicon.css">
    //     <title>React App</title>
    //   </head>

    //   <body>
    //     <div id="root">Hallo</div>
    //   </body>
    // </html>
    // `;
  }
}
