import { FC } from 'react';
import { ExportedFunction } from '../../../src/finder';
import { truncateBackwards } from '@/utils';

export const FunctionItem: FC<{ fn: ExportedFunction }> = ({ fn }) => {
  return (
    <>
      <span className="codicon codicon-symbol-method"></span>
      <div className="function">
        <span className="name">{fn.name}</span>
        <span className="file-path">{truncateBackwards(fn.file, 30)}</span>
        <span className="codicon codicon-arrow-small-right"></span>
      </div>
    </>
  );
};
