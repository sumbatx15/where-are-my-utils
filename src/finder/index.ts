import {
  Project,
  SourceFile,
  FunctionDeclaration,
  VariableDeclaration,
  Expression,
  ArrowFunction,
  CallExpression,
  Type,
  SyntaxKind,
} from 'ts-morph';
import * as vscode from 'vscode';

const REACT_COMPONENT_REGEX = /ReactNode|ReactElement|JSX.Element|ForwardRefExoticComponent/;

export interface ExportedFunction {
  goto: string;
  position: {
    line: number;
    column: number;
  };
  name: string;
  returnType: string;
  file: string;
}

export type ExportedFunctionsMap = Map<string, ExportedFunction>;

const functions: ExportedFunctionsMap = new Map();

function isReactComponent(type: Type): boolean {
  return REACT_COMPONENT_REGEX.test(type.getText());
}

function getNamePosition(declaration: FunctionDeclaration | VariableDeclaration): {
  line: number;
  column: number;
} {
  const name = declaration.getNameNode();
  return declaration
    .getSourceFile()
    .getLineAndColumnAtPos(name?.getStart() || declaration.getStart());
}

function processInitializer(
  declaration: VariableDeclaration,
  initializer: Expression | ArrowFunction | CallExpression | undefined
) {
  if (
    initializer &&
    [SyntaxKind.FunctionExpression, SyntaxKind.ArrowFunction, SyntaxKind.CallExpression].includes(
      initializer.getKind()
    )
  ) {
    return handleFunctionLike(declaration, initializer);
  }
}

async function handleFunctionLike(
  declaration: VariableDeclaration | FunctionDeclaration,
  node: FunctionDeclaration | Expression | ArrowFunction | CallExpression
): Promise<ExportedFunction | null> {
  const returnType = node.getType().getCallSignatures()[0]?.getReturnType();

  if (returnType && !isReactComponent(returnType)) {
    const position = getNamePosition(declaration);
    const sourceFile = declaration.getSourceFile();
    const file = sourceFile.getFilePath();
    const goto = `vscode://file/${file}:${position.line}:${position.column}`;
    const name = declaration.getName() || 'anonymous';

    return {
      name: name,
      returnType: returnType.getText(),
      file,
      goto: goto,
      position,
    };
  }
  return null;
}

function createKey(pos: ExportedFunction) {
  return `${pos.goto}${pos.name}${pos.position.line}${pos.position.column}`;
}

async function processSourceFile(sourceFile: SourceFile) {
  const symbolPromises = sourceFile.getExportSymbols().map(async symbol => {
    const declarationPromises = symbol.getDeclarations().map(async declaration => {
      if (declaration instanceof VariableDeclaration && declaration.getInitializer()) {
        const pos = await processInitializer(declaration, declaration.getInitializer());
        if (pos) {
          functions.set(createKey(pos), pos);
        }
      } else if (declaration instanceof FunctionDeclaration) {
        const pos = await handleFunctionLike(declaration, declaration);
        if (pos) {
          functions.set(createKey(pos), pos);
        }
      }
    });

    await Promise.all(declarationPromises);
  });

  await Promise.all(symbolPromises);
}

async function processAllFiles() {
  const rootPath = vscode.workspace.workspaceFolders?.[0].uri;
  if (!rootPath) {
    return [];
  }

  const tsConfigFilePath = (
    await vscode.workspace.findFiles('**/tsconfig.json', '**/node_modules/**')
  )[0];

  const project = new Project({
    tsConfigFilePath: tsConfigFilePath.fsPath,
  });

  await Promise.all(project.getSourceFiles().map(processSourceFile));
}

export const getFiles = async () => {
  await processAllFiles();
  return Array.from(functions.values());
};
