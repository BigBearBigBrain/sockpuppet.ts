
import { Channel } from "./channel.ts";
import { Client } from "./client.ts";
import { Packet } from "./packet.ts";

interface PuppetConfig {
  port: number;
  host?: string;
}

export class Sockpuppet extends EventTarget {
  private server: Deno.HttpServer;
  private _handshakeVersion = "1.0";

  private clients: Map<WebSocket | string, Client> = new Map();
  private channels: Map<string, Channel> = new Map();

  private messageQueue: Packet[] = [];

  private subscriptions: Map<string, ChannelSubscription<Packet>[]> = new Map();

  constructor(cfg?: PuppetConfig) {
    super();
    this.server = Deno.serve(
      { port: cfg?.port, hostname: cfg?.host },
      (r) => this.handler(r)
    );
  }

  protected handler(req: Request): Response | Promise<Response> {
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);
      this.handleConnection(socket);
      return response;
    }
    return new Response("Not a websocket request", { status: 400 });
  }

  public deleteClient(socket: WebSocket) {
    const client = this.clients.get(socket);
    this.clients.delete(socket);
    this.channels.forEach((channel) => {
      channel.removeClient(client);
    });
  }

  private handleConnection(socket: WebSocket) {
    const client = new Client(crypto.randomUUID(), socket, this);
    this.clients.set(socket, client);
    this.clients.set(client.id, client);

    socket.addEventListener("close", () => {
      this.clients.delete(socket);
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = event.data;
        switch (message) {
          case "ping":
            socket.send("pong");
            break;
          default:
            this.handleMessage(socket, message);
            break;
        }
      } catch (e) {
        console.log(e);
        socket.close();
      }
    });
  }

  private handleMessage(socket: WebSocket, message: string) {
    const msg = JSON.parse(message) as ClientPacket;
    console.log(msg)
    switch (msg.event) {
      case "join":
        this.handleJoin(socket, msg);
        break;
      case "create":
        this.handleCreate(socket, msg);
        break;
      case "leave":
        this.handleLeaveChannel(socket, msg);
        break;
      case "handshake":
        this.handleHandshake(socket, message);
        break;
      default:
        this.handleMessageEvent(socket, msg);
        break;
    }
  }

  /**
   * @description When a handshake is established, a status is sent to the client. With a status of 0, the client can use all of their known methods without concern. With a status of 1, the client will be notified of the outdated handshake version and will be provided with the handshake version that the server supports, to be used in determining which methods the client can use.
   */
  private handleHandshake(socket: WebSocket, message: string) {
    const handshake = JSON.parse(message);
    const client = this.clients.get(socket);
    if (!client) return;
    client.handshakeVersion = handshake.version;
    if (handshake.version > this._handshakeVersion) {
      socket.send(JSON.stringify({
        error: "Outdated server handshake",
        status: 1,
        version: this._handshakeVersion,
        clientId: client.id,
        event: "handshake",
      }));
      return;
    }
    socket.send(JSON.stringify({
      version: this._handshakeVersion,
      status: 0,
      clientId: client.id,
      event: "handshake",
    }));
  }

  private handleJoin(
    socket: WebSocket,
    msg: ClientPacket,
  ) {
    const channel = this.channels.get(msg.to);
    const client = this.clients.get(socket);
    if (!client) return;
    channel?.addClient(client);
    socket.send(
      new Packet(client, "join", msg.to, msg.to).serialize(),
    );
  }

  private handleCreate(socket: WebSocket, msg: ClientPacket) {
    const client = this.clients.get(socket);
    if (!client) return;
    const channel = this.channels.get(msg.to);
    if (!channel) {
      this.createChannel(msg.to);
    }
    socket.send(
      new Packet(client, "create", msg.to, msg.to).serialize(),
    );
  }

  public createChannel(channelId: string) {
    const channel = new Channel(channelId, this);
    this.channels.set(channelId, channel);
    for (const [pattern, subscriptions] of this.subscriptions) {
      if (channelId.match(pattern)) {
        for (const subscription of subscriptions) {
          this.subscribeToChannel(subscription, channel);
        }
      }
    }
  }

  private subscribeToChannel(
    subscription: ChannelSubscription<Packet>,
    channel: Channel,
  ) {
    const unsub = subscription(channel);
    channel.addEventListener("delete", unsub);
  }

  public deleteChannel(channelId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.channels.delete(channelId);
      channel.delete();
    }
  }

  private handleLeaveChannel(socket: WebSocket, msg: ClientPacket) {
    const client = this.clients.get(socket);
    if (!client) return;
    const channel = this.channels.get(msg.to);
    if (channel) {
      channel.removeClient(client);
      socket.send(
        new Packet(client, "leave", msg.to, msg.to).serialize(),
      );
    }
  }

  private handleMessageEvent(
    socket: WebSocket,
    msg: ClientPacket,
  ) {
    const client = this.clients.get(socket);
    if (!client) return;
    this.dispatchEvent(
      new CustomEvent(msg.event, {
        detail: {
          channelId: msg.to,
          message: msg.message,
          echo: msg.echo,
        },
      }),
    );
    const packet = new Packet(
      client,
      msg.event,
      msg.to,
      msg.message,
      msg.echo,
    );
    this.messageQueue.push(packet);
    this.processQueue();
  }

  private processQueue() {
    for (const packet of this.messageQueue) {
      this.channels.get(packet.to)?.sendMessage(packet);
    }
  }

  public subscribe(pattern: string, callback: ChannelSubscription<Packet>) {
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
}
