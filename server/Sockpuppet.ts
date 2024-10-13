import { Channel } from "./channel.ts";
import { Client } from "./client.ts";
import { Packet } from "./packet.ts";

export class Sockpuppet {
  private server: Deno.HttpServer;
  private _socketVersion = "1.0";
  private _handshakeVersion = "1.0";

  private clients: Map<WebSocket, Client> = new Map();
  private channels: Map<string, Channel> = new Map();

  private messageQueue: Packet[] = [];

  constructor() {
    this.server = Deno.serve((req) => {
      if (req.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);
        this.handleConnection(socket);
        return response;
      }
      return new Response("Not a websocket request", { status: 400 });
    });
  }

  public deleteClient(socket: WebSocket) {
    const client = this.clients.get(socket);
    this.clients.delete(socket);
    this.channels.forEach((channel) => {
      channel.removeClient(client);
    });
  }

  private handleConnection(socket: WebSocket) {
    this.clients.set(socket, new Client(crypto.randomUUID(), socket, this));

    socket.addEventListener("close", () => {
      this.clients.delete(socket);
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = event.data;
        console.log(message);
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

  private handleHandshake(socket: WebSocket, message: string) {
    const handshake = JSON.parse(message);
    if (handshake.version !== this._handshakeVersion) {
      socket.send(JSON.stringify({
        error: "Unsupported version",
        version: this._handshakeVersion,
      }));
      socket.close();
      return;
    }
    socket.send(JSON.stringify({
      version: this._socketVersion,
      success: true,
    }));
  }

  private handleMessage(socket: WebSocket, message: string) {
    const msg = JSON.parse(message);
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

  private handleJoin(
    socket: WebSocket,
    msg: { channelId: string; message: string },
  ) {
    const channel = this.channels.get(msg.channelId);
    const client = this.clients.get(socket);
    if (!client) return;
    channel?.addClient(client);
    socket.send(
      new Packet(client, "join", msg.channelId, msg.channelId).serialize(),
    );
  }

  private handleCreate(socket: WebSocket, msg: { channelId: string }) {
    const client = this.clients.get(socket);
    if (!client) return;
    const channel = this.channels.get(msg.channelId);
    if (!channel) {
      this.createChannel(msg.channelId);
    }
    socket.send(
      new Packet(client, "create", msg.channelId, msg.channelId).serialize(),
    );
  }

  public createChannel(channelId: string) {
    this.channels.set(channelId, new Channel(channelId, this));
  }

  private handleLeaveChannel(socket: WebSocket, msg: { channelId: string }) {
    const client = this.clients.get(socket);
    if (!client) return;
    const channel = this.channels.get(msg.channelId);
    if (channel) {
      channel.removeClient(client);
      socket.send(
        new Packet(client, "leave", msg.channelId, msg.channelId).serialize(),
      );
    }
  }

  private handleMessageEvent(
    socket: WebSocket,
    msg: { channelId: string; message: string; echo: boolean },
  ) {
    const client = this.clients.get(socket);
    if (!client) return;
    const packet = new Packet(
      client,
      "message",
      msg.channelId,
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
}
