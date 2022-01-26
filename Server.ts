// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { serve, Server, HTTPOptions, ServerRequest } from "http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
  acceptable
} from "std/ws/mod.ts";

import EventEmitter from './EventEmitter.ts';
import Client from './Client.ts';
import { Packet } from './Packet.ts';
import Transmitter from './Transmitter.ts';
import ITransmitterOptions from './ITransmitterOptions.ts';

export class SocketServer extends EventEmitter {
  private server: Server;

  constructor(options: HTTPOptions, transmitterOptions?: ITransmitterOptions) {
    super();
    this.server = serve(options);
    this.port = options.port;
    this.hostname = options.hostname;
    this.transmitter = new Transmitter(this, transmitterOptions);
    this.Run();
  }

  port: number;
  hostname?: string;

  public transmitter: Transmitter;

  getServer = () => {
    return this.server;
  }

  Run = async () => {
    /** websocket echo server */
    console.log(`websocket server is running on :${this.port}`);
    for await (const req of this.server) {
      if (acceptable(req)) {
        const { conn, r: bufReader, w: bufWriter, headers } = req;
        acceptWebSocket({
          conn,
          bufReader,
          bufWriter,
          headers,
        })
          .then((sock: WebSocket) => this.handleWs(sock, conn))
          .catch(async (err: any) => {
            console.error(`failed to accept websocket: ${err}`);
            await req.respond({ status: 400 });
          });
      } else if (this.handleNonWS) {
        this.handleNonWS(req);
      } else {
        req.respond({ status: 404 });
      }
    }
  }

  handleNonWS?: (req: ServerRequest) => Promise<void>;

  handleWs = async (sock: WebSocket, conn: Deno.Conn) => {
    const client = this.createClient(conn.rid, sock);
    try {
      for await (const ev of sock) {
        if (typeof ev === "string") {
          // text message.
          await this.handleMessageAsString(client, ev);
        } else if (ev instanceof Uint8Array) {
          // binary message.
          await this.handleMessageAsBinary(client, ev);
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev;
          // ping.
          console.log("ws:Ping", body);
        } else if (isWebSocketCloseEvent(ev)) {
          // close.
          const { code, reason } = ev;
          console.log("ws:Close", code, reason);
        }
      }
    } catch (err) {
      console.error(`failed to receive frame: ${err}`);

      if (!sock.isClosed) {
        this.removeClient(conn.rid);
        await sock.close(1000).catch(console.error);
      }
    }
  }

  public close = async () => {
    while (true) {
      if (!this.sender.hasPackets()) {
        if (this.server) {
          try {
            this.server.close();
          } catch (e) {
            break;
          }
        }
      }
    }
  }

  protected async handleMessageAsBinary(client: Client, message: Uint8Array) {
    const decoded = JSON.parse(new TextDecoder().decode(message));
    const packet = new Packet(client, decoded.to, decoded.message);
    return await this.transmitter.handlePacket(packet);
  }

  protected handleMessageAsString = async (client: Client, message: string) => {
    switch (message) {
      case "id":
        client.socket.send(`Client ID: ${client.id}`);
        break;
      case "ping":
        client.socket.send('pong');
        break;
      case "pong":
        client.socket.send('ping');
        break;
      case "test":
        client.socket.send(`Server started on ${this.hostname}:${this.port}`);
        break;
      default:
        return await this.handleMessageAsJson(client, message);
    }
  }

  protected handleMessageAsJson = async (client: Client, message: string) => {
    try {
      const json = JSON.parse(message);

      if (json.send_packet) {
        const packet = new Packet(
          client,
          json.send_packet.to,
          json.send_packet.message
        )
        return await this.transmitter.handlePacket(packet);
      }

      if (json.connect_to) {
        json.connect_to.forEach((channelId: string) => {
          try {
            this.addClientToChannel(channelId, client.id)
            client.socket.send(`Connected to ${channelId}`);
          } catch (e) {
            client.socket.send(e.message);
          }
        });
        return;
      }

      if (json.disconnect_from) {
        json.disconnect_from.forEach((channelId: string) => {
          try {
            this.removeClientFromChannel(channelId, client.id);
            client.socket.send(`Disconnected from ${channelId}`);
          } catch (e) {
            client.socket.send(e.message);
          }
        });
      }

    } catch (e) {
      client.socket.send(e.message);
    }
  }
}