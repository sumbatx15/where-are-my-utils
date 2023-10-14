import { CommandMenu } from './components/combobox';

const vscode = this?.['acquireVsCodeApi'] ? acquireVsCodeApi() : null;
function App() {
  console.log('vscode', vscode);
  return (
    <>
      <CommandMenu />
    </>
  );
}

export default App;
