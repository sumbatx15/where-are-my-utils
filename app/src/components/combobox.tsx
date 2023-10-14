import { Command } from 'cmdk';
import { useState } from 'react';

export const CommandMenu = () => {
  const [value, setValue] = useState('apple');

  return (
    <Command>
      <Command.Input value={value} onValueChange={setValue} />
      <Command.List className='functions-list'>
        <Command.Item
          onSelect={value => {
            console.log('selected', value);
          }}
        >
          Orange2222
        </Command.Item>
        <Command.Item>Apple</Command.Item>
      </Command.List>
    </Command>
  );
};
