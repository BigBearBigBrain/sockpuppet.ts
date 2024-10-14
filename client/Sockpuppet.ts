import { Channel } from "./channel.ts";
import { Message } from "@cgg/sockpuppet/client";

export class Sockpuppet extends EventTarget {
  private _socket!: WebSocket;
  private _handshakeVersion = "1.0";
  private _serverVersion = "1.0";
  private _serverOutdated = false;

  private channels: Map<string, Channel> = new Map();
  private subscriptions: Map<string, ChannelSubscription<ClientPacket>[]> =
    new Map();

  private _id?: string;
  public get id() {
    return this._id;
  }

  private queue: ClientPacket[] = [];

  constructor(url: string | URL) {
    super();
    this.configureSocket(url);
  }

  private configureSocket(url: string | URL) {
    this._socket = new WebSocket(url);
    this._socket.addEventListener("open", () => {
      this._socket.send(JSON.stringify({
        version: this._handshakeVersion,
        event: "handshake",
      }));
      this.processQueue();
    });

    this._socket.addEventListener("message", (e) => {
      try {
        const message = e.data;
        switch (message) {
          case "ping":
            this._socket.send("pong");
            break;
          default:
            this.handleMessage(message);
        }
      } catch (e) {
        console.log("[Sockpuppet]: Error processing message", e);
      }
    });
  }

  private handleMessage(e: string) {
    const message = JSON.parse(e) as ClientPacket;
    switch (message.event) {
      case "join":
        this.handleJoin(message);
        break;
      case "create":
        this.handleCreate(message);
        break;
      case "leave":
        this.handleLeave(message);
        break;
      case "handshake":
        this.handleHandshake(e);
        break;
      default:
        this.handleMessageEvent(message);
        break;
    }
  }
  private handleHandshake(message: string) {
    const handshake = JSON.parse(message);
    this._id = handshake.clientId;
    this._serverVersion = handshake.version;
    this._serverOutdated = Boolean(handshake.status);
  }
  private handleMessageEvent(message: ClientPacket) {
    this.dispatchEvent(
      new CustomEvent<ClientPacket>("message", {
        detail: message,
      }),
    );
    if (message.to === this.id && message.event !== "message") {
      this.dispatchEvent(
        new CustomEvent(message.event, {
          detail: message,
        }),
      );
      return;
    }
    const channel = this.channels.get(message.to);
    if (channel) {
      channel.receiveMessage(message);
    }
  }
  private handleLeave(message: ClientPacket) {
    const channel = this.channels.get(message.to);
    if (channel) {
      channel.delete();
      this.channels.delete(message.to);
    }
  }
  private handleCreate(message: ClientPacket) {
    this.dispatchEvent(
      new CustomEvent("create", {
        detail: message.message,
      }),
    );
  }
  private handleJoin(message: ClientPacket) {
    const channel = new Channel(message.message, this);
    this.channels.set(message.message, channel);
    for (const [pattern, subscriptions] of this.subscriptions.entries()) {
      if (channel.id.match(pattern)) {
        for (const subscription of subscriptions) {
          this.subscribeToChannel(subscription, channel);
        }
      }
    }
  }

  public sendMessage(packet: ClientPacket) {
    this.queue.push(packet);
    this.processQueue();
  }

  public disconnect() {
    this._socket.close();
  }

  public subscribe(
    pattern: string,
    callback: ChannelSubscription<ClientPacket>,
  ) {
    const subscriptions = this.subscriptions.get(pattern);
    if (subscriptions) {
      subscriptions.push(callback);
      for (const [id, channel] of this.channels) {
        if (id.match(pattern)) {
          this.subscribeToChannel(callback, channel);
        }
      }
    } else {
      this.subscriptions.set(pattern, [callback]);
    }
  }
  private subscribeToChannel(
    subscription: ChannelSubscription<ClientPacket>,
    channel: Channel,
  ) {
    const unsub = subscription(channel);
    channel.addEventListener("delete", unsub);
  }

  private processQueue() {
    if (this._socket.OPEN !== 1) return;
    while (this.queue.length > 0) {
      const packet = this.queue.shift();
      this._socket.send(JSON.stringify(packet));
    }
  }

  public createChannel(channelId: string) {
    this.queue.push(Message.event("create", undefined, channelId));
  }
  public joinChannel(channelId: string) {
    this.queue.push(Message.event("join", undefined, channelId));
  }
  public leaveChannel(channelId: string) {
    this.queue.push(Message.event("leave", undefined, channelId));
  }
}
