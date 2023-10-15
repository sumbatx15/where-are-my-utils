import { Command } from 'cmdk';
import { FC } from 'react';
import { ExportedFunction } from '../../../src/finder';
import { FunctionItem } from './fn';
import { vscode } from '@/App';

export const CommandMenu: FC<{ fns: ExportedFunction[]; isLoading: boolean }> = ({
  fns,
  isLoading,
}) => {
  return (
    <Command
      filter={(value, search) => {
        console.log('value:', value)
        if (value.includes(search)) return 1;
        return 0;
      }}
      className="command-container"
      style={{ flex: 1 }}
    >
      {isLoading && <Command.Loading>Fetching words…</Command.Loading>}
      <Command.Input />
      <Command.List className="functions-list">
        {fns.map(fn => (
          <Command.Item
            className="function-container"
            key={fn.name + fn.file}
            value={fn.name}
            onSelect={() => {
              console.log('vscode: goto', vscode);
              return vscode?.postMessage({ type: 'GOTO_LINE', payload: fn });
            }}
          >
            <FunctionItem fn={fn} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
