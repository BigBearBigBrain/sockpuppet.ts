import { Message } from "./message";

export type channelCallback<T> = (message: T) => void;
export type socketCallback = (message?: Message | string) => void;