import React, { useEffect, useState, useCallback } from 'react';
import { MemoryRouter as Router, Link, Switch } from 'react-router-dom';
import { routes } from '../routes/config';
import { RouteWithSubRoutes } from '../routes/RouteWithSubRoutes';
import { MessagesContext } from '../context/MessageContext';
import {
  CommonMessage,
  GetFilesMessage,
  GotoLineMessage,
  Message,
  MessageType,
  Messages,
  ReloadMessage,
} from '../../src/view/messages/messageTypes';
import type { ExportedFunctions } from '../../src/finder';
import { SourceLocation } from '@babel/types';
import { ComboboxDemo } from './ComboBox';

const truncateBackwards = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return '...' + str.slice(str.length - maxLength);
  }
  return str;
};

export const App = () => {
  const [messagesFromExtension, setMessagesFromExtension] = useState<string[]>([]);
  const [files, setFiles] = useState<ExportedFunctions>([]);
  const [dirname, setDirname] = useState<string>('');
  const [filter, setFilter] = useState<string>('');

  const handleMessagesFromExtension = useCallback((event: MessageEvent<Messages>) => {
    switch (event.data.type) {
      case 'FILES': {
        const files = event.data.payload;
        setFiles(files.map(file => ({ ...file, path: new URL(file.path).pathname })));
        break;
      }
      case 'DIRNAME': {
        const dirname = event.data.payload;
        const pathname = new URL(dirname).pathname;
        setDirname(pathname);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', (event: MessageEvent<Messages>) => {
      handleMessagesFromExtension(event);
    });

    return () => {
      window.removeEventListener('message', handleMessagesFromExtension);
    };
  }, [handleMessagesFromExtension]);

  const gotoLine = (payload: GotoLineMessage['payload']) => {
    vscode.postMessage<Messages>({
      type: 'GO_TO_LINE',
      payload,
    });
  };

  useEffect(() => {
    vscode.postMessage<Message>({
      type: 'GET_DIRNAME',
    });
    vscode.postMessage<GetFilesMessage>({
      type: 'GET_FILES',
    });
  }, []);

  const functions = (
    files
      .map(file => file.exports.map(func => ({ ...func, path: file.path })))
      // @ts-ignore
      .flat() as {
      path: string;
      name: string;
      loc: SourceLocation | null | undefined;
    }[]
  )
    .filter(func => {
      const regex = new RegExp(filter, 'i');
      return regex.test(func.name);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Router initialEntries={['/', '/about', '/message', '/message/received', '/message/send']}>
      <MessagesContext.Provider value={messagesFromExtension}>
        {/* <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
        </Switch> */}
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexFlow: 'column',
            gap: '10px',
          }}
        >
          <h3>Where are my utils?</h3>
        <ComboboxDemo />

          <input
            className="search-input"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: '100%' }}
          />
          <div className="function-list">
            {functions.map((func, j) => (
              <section className="function-container">
                <span
                  className="codicon codicon-symbol-method"
                  style={{
                    color: '#A579C8',
                  }}
                ></span>
                <div
                  key={j}
                  className="function"
                  onClick={() =>
                    gotoLine({
                      path: func.path,
                      loc: func.loc,
                    })
                  }
                >
                  <span className="name">{func.name}</span>
                  <span className="src">
                    {truncateBackwards(func.path.replace(dirname, ''), 50)}
                  </span>
                  <span className="codicon codicon-arrow-small-right"></span>
                </div>
              </section>
            ))}
          </div>
          {/* {files.map((file, i) => (
              <div style={{ maxWidth: '100%', marginBottom: 10 }} key={i}>
                <div style={{ maxWidth: '100%' }}>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      direction: 'rtl',
                      textAlign: 'left',
                      fontSize: '0.7em',
                      opacity: 0.7,
                    }}
                  >
                    {file.path.replace(dirname, '')}
                  </span>

                  <ul style={{ maxWidth: '100%' }}>
                    {file.exports.map((func, j) => (
                      <li
                        onClick={() =>
                          gotoLine({
                            path: file.path,
                            loc: func.loc,
                          })
                        }
                        style={{ maxWidth: '100%', cursor: 'pointer' }}
                        key={j}
                      >
                        {func.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))} */}
        </div>
      </MessagesContext.Provider>
    </Router>
  );
};
