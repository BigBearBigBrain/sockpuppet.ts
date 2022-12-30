import { useCallback, useState } from 'preact/hooks';
import { channelCallback } from './callbackTypes';

export class Channel<T = string> {
  public id: string;

  private socket: WebSocket;

  public callbacks: Map<string, channelCallback<T>[]> = new Map();

  public echo?: boolean;
  
  constructor(id: string, socket: WebSocket) {
    this.id = id;
    this.socket = socket;

    this.callbacks.set('join', []);
    this.callbacks.set('leave', []);
    this.callbacks.set('message', []);
  }

  public send = (message: string, clientToSendTo?: string) =>
    this.socket.send(JSON.stringify({
      send_packet: {
        to: this.id,
        message,
        clientToSendTo,
        echo: this.echo
      }
    }));

  public execListeners = (message: T) => this.callbacks.get('message')?.forEach(cb => cb(message));
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Map<string,Channel>>(new Map());

  const newChannel = useCallback((id: string, socket: WebSocket) => {
    const channel = new Channel(id, socket);
    setChannels(old => {
      const channels = new Map(old.entries());

      channels.set(id, channel)
      
      return channels;
    })
  }, [setChannels]);

  return {
    channels,
    newChannel
  }
}
