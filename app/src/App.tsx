import { useCallback, useEffect, useState } from 'react';
import { ExportedFunction } from '../../src/finder';
import { GetFilesMessage, Messages } from '../../src/view/messages/messageTypes';
import { CommandMenu } from './components/combobox';

// @ts-expect-error vscode is not defined in the browser
export const vscode = window?.['acquireVsCodeApi'] ? acquireVsCodeApi() : null;

function App() {
  const [fns, setFns] = useState<ExportedFunction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const handleMessagesFromExtension = useCallback((event: MessageEvent<Messages>) => {
    switch (event.data.type) {
      case 'FILES': {
        setFns(event.data.payload || []);
        setIsLoading(false);
        break;
      }
      case 'DIRNAME': {
        const dirname = event.data.payload;
        const pathname = new URL(dirname).pathname;
        console.log('pathname:', pathname);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessagesFromExtension);
    return () => {
      window.removeEventListener('message', handleMessagesFromExtension);
    };
  }, [handleMessagesFromExtension]);

  useEffect(() => {
    vscode?.postMessage<GetFilesMessage>({
      type: 'GET_FILES',
    });
  }, []);

  return (
    <>
      <h3>Where are my utils?</h3>
      <CommandMenu fns={fns} isLoading={isLoading} />
    </>
  );
}

export default App;
