import { useCallback, useEffect, useState } from 'preact/hooks';
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

  public send = (message: string, clientToSendTo?: string) => {
    this.socket.send(JSON.stringify({
      send_packet: {
        to: this.id,
        message,
        clientToSendTo,
        echo: this.echo
      }
    }));
  }

  public execListeners = (message: T) => this.callbacks.get('message')?.forEach(cb => cb(message));
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Record<string, Channel<any>>>({});

  const newChannel = useCallback(<T = string>(id: string, socket: WebSocket, handler: channelCallback<T>) => {
    setChannels(old => {
      const channel = new Channel<T>(id, socket);
      channel.callbacks.get('message')?.push(handler);
      channel.echo = true;
      const channels = { ...old };
      channels[id] = channel;
      return channels;
    })
  }, [setChannels]);

  const removeChannel = useCallback((id: string) => {
    setChannels(old => {
      const channels = { ...old };
      delete channels[id];
      return channels;
    })
  }, [setChannels])

  return {
    channels,
    newChannel,
    removeChannel
  }
}
