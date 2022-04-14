import Channel from './Channel.ts';
import Client from './Client.ts';
import Sender from './Sender.ts';
import { packetCallback, disconnectCallback } from './callbackType.ts';
import { Packet } from './Packet.ts';

export default class EventEmitter {
  constructor(id?: string) {
    this.channels = new Map();
    this.clients = new Map();
    this.sender = new Sender();
    this.id = id || "Server";
  }
  public id: string;

  public channels: Map<string, Channel>;

  public clients: Map<string, Client>;

  public sender: Sender;

  public createNewChannel = (channelId?: string) => {
    if (!channelId) {
      channelId = crypto.randomUUID();
    }
    const channel = new Channel(channelId)
    this.channels.set(channelId!, channel);
    return channel;
  }

  public closeChannel = (channelId: string) => {
    for (const client of this.clients.values()) {
      client.socket.send(`${channelId} closed.`);
    }
    this.channels.delete(channelId);
  };


  public createClient = (clientId: string, clientSocket: WebSocket) => {
    const client = new Client(clientId, clientSocket)
    this.clients.set(clientId, client);
    return client;
  }

  public addClientToChannel = (channelId: string, clientId: string) => {
    const channel: Channel | undefined = this.channels.get(channelId);
    if (!channel) throw new Error(`Channel "${channelId}; does not exist.`);
    const client: Client | undefined = this.clients.get(clientId);
    if (!client) throw new Error(`Client "${clientId}; does not exist.`);

    if (!channel!.listeners.get(clientId)) channel.listeners.set(clientId, client.socket);
    client.socket.send(`joined ${channelId}`);
  }

  public removeClientFromChannel = (channelId: string, clientId: string) => {
    const channel: Channel | undefined = this.channels.get(channelId);
    if (!channel) throw new Error(`Channel "${channelId}; does not exist.`);
    const client = this.clients.get(clientId);
    if (client) client.socket.send(JSON.stringify({
      event: 'leave',
      message: `left ${channelId}`,
      to: clientId,
      from: this.id
    }));
  channel.disconnectCallbacks.forEach(cb => cb(clientId));
channel.listeners.delete(clientId);
  }

  public removeClient = (clientId: string) => {
  for (const channel of this.channels.values()) {
    channel.listeners.delete(clientId);
  }
  const client = this.clients.get(clientId);
  if (client && client.socket.OPEN) client.socket.send('disconnected');
  this.clients.delete(clientId);
}

  public connectCallbacks: (packetCallback)[] = [];
  public onConnect = (callback: packetCallback) => this.connectCallbacks.push(callback);

  public disconnectCallbacks: disconnectCallback[] = [];
  public onDisconnect = (callback: disconnectCallback) => this.disconnectCallbacks.push(callback);

  public getClients = () => this.clients;
  public getChannels = () => this.channels;
  public getChannel = (channelId: string) => this.channels.get(channelId);

  public to = (channelId: string, message: unknown, clientToSendTo?: string) => {
  this.queuePacket(new Packet(this, channelId, message), clientToSendTo);
}

  public queuePacket = (packet: Packet, clientToSendTo?: string) => {
  const channel = this.channels.get(packet.to);
  if (channel) {
    this.sender.add(packet, channel, clientToSendTo);
  } else throw new Error(`Channel "${packet.to}" does not exist!`);
}
}