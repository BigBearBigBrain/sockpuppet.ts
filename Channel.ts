import { packetCallback, disconnectCallback } from './callbackType.ts';

export default class Channel {
  public id: string;

  public listeners: Map<string, WebSocket>;

  public callbacks: packetCallback[] = [];
  public disconnectCallbacks: disconnectCallback[] = [];

  constructor(channelId: string) {
    this.id = channelId;
    this.listeners = new Map();
  }

  public addListener = (callback: packetCallback) => this.callbacks.push(callback);

  public onDisconnect = (callback: disconnectCallback) => this.disconnectCallbacks.push(callback);
}