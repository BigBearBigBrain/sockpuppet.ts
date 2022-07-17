import { SocketServer } from './Server.ts';
import { Packet } from './Packet.ts';
import Client from './Client.ts';
import Channel from './Channel.ts';
import { packetCallback, disconnectCallback } from './callbackType.ts';
import ITransmitterOptions from './ITransmitterOptions.ts';

const RESERVED_EVENT_NAMES = [
  "connect",
  "disconnect",
  "error",
  "pong",
  "reconnect"
]

export default class Transmitter {
  private pingInterval: number | undefined = 2000;

  private pingTimeout: number | undefined = 4000;

  private reconnect: boolean | undefined = true;

  private server: SocketServer;

  constructor(server: SocketServer, options?: ITransmitterOptions) {
    if (options) {
      this.reconnect = options.reconnect ?? true;
      this.pingInterval = options.pingInterval || 2000;
      this.pingTimeout = options.pingTimeout || 4000;
    }

    this.server = server;
  }

  public handlePacket = (packet: Packet) => {
    if (RESERVED_EVENT_NAMES.includes(packet.to)) {
      return this.handleReservedEvent(packet);
    }
    
    const channel: Channel | undefined = this.server.channels.get(packet.to);
    if (channel) {
      if (!(channel as Channel).listeners.has((packet.from as Client).id)) throw new Error(`Client ${packet.from.id} is not subscribed to "${packet.to}"`)

      for (const callback of channel.middleware) {
        callback(packet);
      }

      for (const callback of channel.callbacks) {
        callback(packet);
      }
    } else throw new Error(`Channel "${packet.to}" does not exist!`);
  }

  public handleReservedEvent(packet: Packet): void {
    const event = packet.to;

    switch (event) {
      case "connect":
        if (this.server.connectCallbacks.length) this.server.connectCallbacks.forEach((cb: packetCallback) => cb(packet));
        break;
      case "disconnect":
        if (this.server.disconnectCallbacks.length) this.server.disconnectCallbacks.forEach((cb: disconnectCallback) => cb((packet.from as Client).id));
        break;

      case "error":
        if (packet.from instanceof Client) packet.from.socket.send("An error occurred with the connection.")
        break;

      case "pong":
        if (packet.from instanceof Client) {
          const client = this.server.clients.get(packet.from.id);
          if (!client) {
            if (packet.from instanceof Client) {
              this.server.createClient(packet.from.id, packet.from.socket);
              this.hydrateClient(packet.from.id);
            }
          }
        }
        break;

      case "reconnect":
        // this does something, eventually
        break;

      default:
        break;
    }
  }

  public hydrateClient = (clientId: string): void => {
    if (this.reconnect) {
      const client = this.server.clients.get(clientId);
      if (client) {
        client.pongReceived = true;
        client.heartbeat = this.startHeartbeat(clientId);
      }
    }
  }

  public startHeartbeat(clientId: string) {
    const id = setInterval(() => this.ping(clientId), this.pingInterval);
    return id;
  }

  public ping = (clientId: string) => {
    const client = this.server.clients.get(clientId);
    "Heartbeat"
    if (client) {
      if (client.pongReceived) {
        client.socket.send('ping');
        client.pongReceived = false;
      } else {
        setTimeout(() => this.timeoutPing(clientId), this.pingTimeout);
      }
    }
  }

  public timeoutPing = (clientId: string) => {
    const client = this.server.clients.get(clientId);
    if (client) {
      if (client.heartbeat) clearInterval(client.heartbeat);
      this.server.removeClient(clientId);
    }
  }
}