import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as fs from 'fs';
import { glob } from 'glob';
import * as vscode from 'vscode';

export interface ExportedFunction {
  name: string;
  loc: t.SourceLocation | null | undefined;
}

export type ExportedFunctions = {
  path: string;
  exports: ExportedFunction[];
}[];

const findExportedFunctions = (code: string): ExportedFunction[] => {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const exportedFunctions: {
      name: string;
      loc: t.SourceLocation | null | undefined;
    }[] = [];

    traverse(ast, {
      ExportNamedDeclaration(path) {
        if (t.isVariableDeclaration(path.node.declaration)) {
          const isJSX = path.node.declaration.declarations.some(declaration => {
            if (t.isCallExpression(declaration.init)) {
              return true;
            }

            let isJSX = false;
            if (t.isArrowFunctionExpression(declaration.init)) {
              path.traverse({
                JSXElement(childPath) {
                  isJSX = true;
                  childPath.stop();
                },
                JSXFragment(childPath) {
                  isJSX = true;
                  childPath.stop();
                },
              });
            }
            return isJSX;
          });

          if (isJSX) {
            return path.skip();
          }

          path.node.declaration.declarations.forEach(declaration => {
            if (t.isArrowFunctionExpression(declaration.init) && t.isIdentifier(declaration.id)) {
              const name = declaration.id.name;
              const loc = declaration.loc;
              exportedFunctions.push({ name, loc });
            }
          });
        } else if (t.isFunctionDeclaration(path.node.declaration)) {
          let isJSX = false;
          path.traverse({
            JSXElement(childPath) {
              isJSX = true;
              childPath.stop();
            },
            JSXFragment(childPath) {
              isJSX = true;
              childPath.stop();
            },
          });

          if (isJSX) {
            return path.skip();
          }
          // check if its a jsx
          const name = path.node.declaration.id?.name;
          const loc = path.node.declaration.loc;
          if (name) {
            exportedFunctions.push({ name, loc });
          }
        }
      },
    });

    return exportedFunctions;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getFiles = async (): Promise<ExportedFunctions> => {
  const rootPath = vscode.workspace.workspaceFolders?.[0].uri;
  if (!rootPath) {
    return [];
  }

  const globPattern = vscode.Uri.joinPath(rootPath, '/**/*.{js,jsx,ts,tsx}');
  const ignore = [vscode.Uri.joinPath(rootPath, '/node_modules/**')].map(uri => uri.fsPath);

  const files = glob.sync(globPattern.fsPath, { ignore });
  const exportedFunctions = files.map(async file => {
    const code = fs.readFileSync(file, 'utf-8');
    const exports = findExportedFunctions(code);
    return { path: file, exports };
  });

  return await Promise.all(exportedFunctions);
};
