// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { serve } from "https://deno.land/std@0.134.0/http/mod.ts";

import EventEmitter from './EventEmitter.ts';
import Client from './Client.ts';
import { Packet } from './Packet.ts';
import Transmitter from './Transmitter.ts';
import ITransmitterOptions from './ITransmitterOptions.ts';
import Channel from './Channel.ts'
import { getMime } from "./utils/getMime.ts";

interface PuppetOptions {
  dashboard?: boolean;
}

export class SocketServer extends EventEmitter {
  protected PermanentChannels: Map<string, Channel> = new Map();

  constructor(options: Deno.ListenOptions & PuppetOptions, transmitterOptions?: ITransmitterOptions) {
    super();
    this.port = options.port;
    this.hostname = options.hostname;
    this.transmitter = new Transmitter(this, transmitterOptions);
    this.showDash = options.dashboard ?? true;

    // if (this.showDash) {
    //   try {
    //     const files = Deno.readDirSync('./dash/dist')
    //     for (const file of files) {
    //       console.log(file.name);
    //     }
    //   } catch {
        
    //   }
    // }
    
    this.Run();
  }

  port?: number;
  hostname?: string;

  public transmitter: Transmitter;

  private showDash: boolean;

  private startTime = Date.now();
  private totalMessages = 0;

  Run = () => {
    /** websocket echo server */
    console.log(`Sockpuppet is running on ${this.hostname}:${this.port}`);

    serve(async (req) => {
      if (req.headers.get('upgrade') === 'websocket') {
        try {
          const { response, socket } = Deno.upgradeWebSocket(req, { idleTimeout: 0 });
          this.handleWs(socket);
          return response;
        } catch (err) {
          console.error(`failed to accept websocket: ${err}`);
          return new Response('There was an error while upgrading the socket\n' + err, { status: 500 });
        }
      } else if (this.handleNonWS) {
        return await this.handleNonWS(req);
      } else {
        return new Response(this.handleNonWS ? 'Resource not found' : 'Request is not upgradable', { status: this.handleNonWS ? 404 : 400 });
      }
    }, { hostname: this.hostname, port: this.port || 5038 })
  }

  handleNonWS?: (req: Request) => Promise<Response> = async (req) => {
    if (!this.showDash) return new Response('Dashboard is disabled')
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);

    if (path === '/') path = '/index.html'

    let file;
    try {
      file = await Deno.open('./dash/dist' + path, { read: true });
    } catch {
      return new Response('Resource not found');
    }

    const headers = new Headers(req.headers);
    headers.set('Content-Type', getMime(path))

    const res = new Response(file!.readable, { headers });
    return res;
  }

  handleWs = (sock: WebSocket) => {
    const client = this.createClient(crypto.randomUUID(), sock);

    sock.onopen = () => {
      setTimeout(() => sock.readyState === 1 && sock.send('ping'), 2000)
    }

    sock.onmessage = async (ev) => {
      this.totalMessages++;
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
      case "pong": {
        this.totalMessages--;
        const packet = new Packet(client, 'pong');
        this.transmitter.handlePacket(packet);
        // console.log(this.clients);
        break;
      }
      case "test":
        client.socket.send(`Server started on ${this.hostname}:${this.port}`);
        break;
      case "channels": {
        const packet = new Packet(client, 'channels');
        packet.message = Array.from(this.channels.values()).map(c => ({ id: c.id, listeners: c.listeners.size, createdAt: c.createdAt, lastMessage: c.lastMessage }));
        this.transmitter.handlePacket(packet);
      }
        break;
      case "meta": {
        this.totalMessages--;
        const packet = new Packet(client, 'meta')
        packet.message = {
          serverStart: this.startTime,
          listeners: this.clients.size,
          totalMessages: this.totalMessages
        },
        this.transmitter.handlePacket(packet);
      }
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
          json.send_packet.message,
          json.send_packet.echo
        )
        return await this.transmitter.handlePacket(packet);
      }

      if (json.connect_to) {
        json.connect_to.forEach((channelId: string) => {
          try {
            this.addClientToChannel(channelId, client.id)
            client.listeningTo.push(channelId)
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
            client.listeningTo.filter(cid => cid !== channelId)
            client.socket.send(`Disconnected from ${channelId}`);
          } catch (e) {
            client.socket.send(e.message);
          }
        });
      }

      if (json.create_channel) {
        try {
          let channel = this.channels.get(json.create_channel)
          if (!channel) {
            channel = this._createNewChannel(json.create_channel);
            channel.disconnectCallbacks.push(() => {
              if (!channel!.listeners.size) this.channels.delete(channel!.id)
            })
          }
          client.socket.send(JSON.stringify({
            event: 'create',
            status: 'SUCCESS',
            channelId: channel.id
          }));
        } catch (e) {
          client.socket.send(JSON.stringify({
            event: 'create',
            status: 'FAILED',
            reason: e.message
          }));
        }
      }

    } catch (e) {
      client.socket.send(e.message);
    }
  }

  public createChannel = (channelId: string) => {
    this.PermanentChannels.set(channelId, this._createNewChannel(channelId));
    return this.PermanentChannels.get(channelId)!;
  }
}