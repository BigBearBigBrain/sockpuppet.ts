// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { serve } from "https://deno.land/std@0.134.0/http/mod.ts";

import EventEmitter from './EventEmitter.ts';
import Client from './Client.ts';
import { Packet } from './Packet.ts';
import Transmitter from './Transmitter.ts';
import ITransmitterOptions from './ITransmitterOptions.ts';

export class SocketServer extends EventEmitter {
  constructor(options: Deno.ListenOptions, transmitterOptions?: ITransmitterOptions) {
    super();
    this.port = options.port;
    this.hostname = options.hostname;
    this.transmitter = new Transmitter(this, transmitterOptions);
    this.Run();
  }

  port?: number;
  hostname?: string;

  public transmitter: Transmitter;

  Run = () => {
    /** websocket echo server */
    console.log(`Sockpuppet is running on :${this.port}`);

    serve((req) => {
      if (req.headers.get('upgrade') === 'websocket') {
        try {
          const { response, socket } = Deno.upgradeWebSocket(req);
          this.handleWs(socket);
          return response;
        } catch (err) {
          console.error(`failed to accept websocket: ${err}`);
          return new Response('There was an error while upgrading the socket\n' + err, { status: 500 });
        }
      } else if (this.handleNonWS) {
        return this.handleNonWS(req);
      } else {
        return new Response(this.handleNonWS ? 'Resource not found' : 'Request is not upgradable', { status: this.handleNonWS ? 404 : 400 });
      }
    }, { hostname: this.hostname, port: this.port })
  }

  handleNonWS?: (req: Request) => Response;

  handleWs = (sock: WebSocket) => {
    const client = this.createClient(crypto.randomUUID(), sock);
    sock.onmessage = async (ev) => {
      try {
        if (typeof ev.data === "string") {
          // text message.
          await this.handleMessageAsString(client, ev.data);
        } else if (ev.data instanceof Uint8Array) {
          // binary message.
          await this.handleMessageAsBinary(client, ev.data);
        }
      } catch (err) {
        console.error(`failed to receive frame: ${err}`);

        if (!sock.CLOSED) {
          await sock.close(1000);
        }
      }
    }

    sock.onclose = () => {
      this.removeClient(client.id);
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