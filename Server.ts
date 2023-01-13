// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { serve } from "https://deno.land/std@0.134.0/http/mod.ts";

import EventEmitter from './EventEmitter.ts';
import Client from './Client.ts';
import { Packet } from './Packet.ts';
import Transmitter from './Transmitter.ts';
import ITransmitterOptions from './ITransmitterOptions.ts';
import Channel from './Channel.ts'
import { getMime } from "./utils/getMime.ts";
import { Sockpuppet } from "./mod.ts";

interface PuppetOptions {
  dashboard?: boolean;
  dashboardVersion?: '1'
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
  static dashVersion = '1';
  static readonly puppetVersion = '0.6'

  Run = () => {
    try {
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

      console.log(`Sockpuppet is running on ws://${this.hostname || 'localhost'}:${this.port}`);
      if (this.showDash) {
        console.log(`Sockpuppet dashboard is available on http://${this.hostname || 'localhost'}:${this.port}`);
      }
    } catch {
      console.error('Error starting Sockpuppet');
    }
  }

  handleNonWS?: (req: Request) => Promise<Response> = async (req) => {
    if (!this.showDash) return new Response('Dashboard is disabled')
    if (Deno.env.get('VITE_IN_CONTAINER')) {
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
    } else {
      return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Puppetshow</title>
        <style>
          html {
            font-family: 'Open Sans', sans-serif;
            color: white;
          }
      
          body {
            --tw-gradient-from: #280728;
            --tw-gradient-to: rgb(40 7 40 / 0);
            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
            --tw-gradient-to: #27384a;
            --tw-bg-opacity: 1;
            background-color: rgb(35 40 46 / var(--tw-bg-opacity));
            background-image: radial-gradient(closest-side at center, var(--tw-gradient-stops));
            border-right-color: #1904191a;
            border-bottom-color: #1904191a;
            border-top-color: #fcfcfc1a;
            border-left-color: #fcfcfc1a;
            display: grid;
            height: 100vh;
            width: 100vw;
            margin: 0;
            animation: floating-g 100s linear infinite forwards;
      
          }
      
          @keyframes floating-g {
            0% {
              background-size: 500% 500%;
              background-position: top right;
            }
      
            30% {
              background-size: 200% 500%;
              background-position: bottom;
            }
      
            60% {
              background-size: 500% 200%;
              background-position: top left;
            }
      
            100% {
              background-size: 500% 500%;
              background-position: top right;
            }
          }
      
          div {
            place-self: center;
            text-align: center;
          }
      
          h1 {
            text-shadow: #280728 3px 3px 5px;
          }
      
          p {
            color: gray;
            margin-bottom: 4rem;
          }
      
          a {
            padding: .75rem;
            background-color: #386C9C;
            border-radius: .75rem;
            color: white;
            text-decoration: none;
          }
      
          .dance {
            height: 8rem;
          }
      
          img {
            max-height: 100%;
            animation: jump 2s linear infinite normal;
          }
      
          @keyframes jump {
            0% {
              transform: scale(1, 1) translateY(0);
            }
      
            10% {
              transform: scale(1.1, .9) translateY(0);
            }
      
            30% {
              transform: scale(.9, 1.1) translateY(-2rem);
            }
      
            50% {
              transform: scale(1.05, .95) translateY(0);
            }
      
            57% {
              transform: scale(1, 1) translateY(-7px);
            }
      
            64% {
              transform: scale(1, 1) translateY(0);
            }
      
            100% {
              transform: scale(1, 1) translateY(0);
            }
          }
        </style>
      </head>
      
      <body>
        <div>
          <h1>Puppetshow is ready</h1>
          <div class="dance">
            <img src="http://puppetshow.cyborggrizzly.com/sockpuppet-solo.svg" />
          </div>
          <p>Click the link below to open Puppetshow and start monitoring Sockpuppet</p>
          <a type="button">Open Puppetshow</a>
        </div>
      </body>
      <script>
        document.querySelector('a').href = \`https://puppetshow.cyborggrizzly.com?host=ws://\${location.host}\`
      </script>
      </html>
      `, {
        headers: {
          "content-type": "text/html",
        }
      });
    }
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
        packet.message = Array.from(this.channels.values()).map(c => ({ id: c.id, listeners: c.listeners.size, createdAt: c.createdAt, lastMessage: c.lastMessage, dashVersion: Sockpuppet.dashVersion }));
        this.transmitter.handlePacket(packet);
      }
        break;
      case "meta": {
        this.totalMessages--;
        const packet = new Packet(client, 'meta')
        packet.message = {
          dashVersion: Sockpuppet.dashVersion,
          serverStart: this.startTime,
          listeners: this.clients.size,
          totalMessages: this.totalMessages
        },
          this.transmitter.handlePacket(packet);
      }
        break;
      case 'handshake': {
        this.totalMessages--;
        const packet = new Packet(client, 'handshake');
        packet.message = {
          puppetVersion: Sockpuppet.puppetVersion
        }
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