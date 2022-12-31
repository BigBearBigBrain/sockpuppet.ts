import { Message } from "./message";

export interface Packet<T> {
  to: string,
  message: T,
  clientToSendTo: string,
  echo: boolean
}

export type channelCallback<T> = (message: T, packet: Message<T>) => void;
export type socketCallback = (message?: Message | string) => void;