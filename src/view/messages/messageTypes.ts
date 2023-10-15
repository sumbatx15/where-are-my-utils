import { ExportedFunction } from '../../finder';

export interface Message {
  type: MessageType;
  payload?: any;
}

export interface CommonMessage extends Message {
  type: 'COMMON';
  payload: string;
}

export interface ReloadMessage extends Message {
  type: 'RELOAD';
}
export interface GetFilesMessage extends Message {
  type: 'GET_FILES';
}

export interface FilesMessage extends Message {
  type: 'FILES';
  payload: ExportedFunction[];
}

export interface DirnameMessage extends Message {
  type: 'DIRNAME';
  payload: string;
}
export interface GotoLineMessage extends Message {
  type: 'GOTO_LINE';
  payload: ExportedFunction;
}

export type Messages =
  | ReloadMessage
  | CommonMessage
  | GetFilesMessage
  | FilesMessage
  | DirnameMessage
  | GotoLineMessage;

export type MessageType = Messages['type'] | 'GET_DIRNAME';
