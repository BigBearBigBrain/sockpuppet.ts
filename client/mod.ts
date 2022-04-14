import { socketCallback } from "./callbackTypes.ts";
import { Channel } from "./Channel.ts";
import { Message } from "./Message.ts";

export class Sockpuppet {
  private socket: WebSocket;

  public channels: Map<string, Channel>;

  public callbacks: Map<string, socketCallback[]>;

  constructor(path: string, onConnect?: () => void) {
    if (isFullUrl(path)) this.socket = new WebSocket(path)
    else this.socket = new WebSocket(`${window.location.host}${path}`);

    if (onConnect) this.socket.addEventListener('open', () => {
      onConnect();
    })

    this.socket.addEventListener('message', this.handleMessage);

    this.channels = new Map();
    this.callbacks = new Map([
      ['disconnect', []]
    ]);
  }

  public joinChannel = (channelId: string) => {
    const channel = new Channel(channelId, this.socket)
    this.channels.set(channelId, channel);
    return channel;
  }

  public on = (event: string, callback: socketCallback) => {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []).get;
    }
    this.callbacks.get(event)?.push(callback);
  }

  public onDisconnect = (callback: socketCallback) => this.callbacks.get('disconnect')?.push(callback);

  private handleMessage = (message: MessageEvent<string>) => {
    // Handle any events
    switch (message.data) {
      case "open":
      case "connected":
        //I'm sure these may be useful
        break;
      case "disconnected":
        this.callbacks.get('disconnect')?.forEach(cb => cb(message.data));
        this.channels.forEach(channel => channel.execLeaveListeners());
        break;
      // case ""
      default:
        try {
          const msg = new Message(JSON.parse(message.data));
          if (msg.event === 'leave') 
            this.deleteChannel(msg.to);
          if (msg.event === 'join') 
            this.channels.get(msg.to)?.execJoinListeners();
          this.callbacks.get(msg.event || msg.message)?.forEach(cb => cb(msg));
          this.channels.get(msg.to)?.execListeners(msg.message);
        } catch (_e) {
          const msg = message.data;
          this.callbacks.get(msg)?.forEach(cb => cb(msg));
        }
        break;
    }
  }

  public leaveChannel = (channelId: string) =>
    this.socket.send(JSON.stringify({
      disconnect_from: [channelId]
    }));

  private deleteChannel = (channelId: string) => {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.execLeaveListeners();
      this.channels.delete(channelId);
    }
  }
}

const isFullUrl = (url: string) => /(wss?|https?):\/\/.+\.(io|com|org|net)(\/.*)?/i.test(url);