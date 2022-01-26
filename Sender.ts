import { Packet } from './Packet.ts';
import Channel from './Channel.ts';

export default class Sender {
  private packetQueue: { packet: Packet, channel: Channel, clientToSendTo?: number }[] = [];

  private ready = true;

  public add = (packet: Packet, channel: Channel, clientToSendTo?: number) => {
    this.packetQueue.push({ packet, channel, clientToSendTo });
    this.send();
  }

  public hasPackets = () => !!this.packetQueue.length;

  private send = async () => {
    if (this.ready && this.packetQueue.length) {
      this.ready = false;

      const queueItem = this.packetQueue.shift();
      if (queueItem) {
        for await (const [clientId, socket] of queueItem.channel.listeners.entries()) {
          if (clientId === queueItem.packet.from.id) continue;

          if (queueItem.clientToSendTo && queueItem.clientToSendTo !== clientId) continue;

          try {
            const message = JSON.stringify({
              from: queueItem.packet.from.id,
              to: queueItem.packet.to,
              message: queueItem.packet.message
            });
            await socket.send(message);
          } catch (e) {
            console.log(`Unable to send message to ${clientId}`);
          }
        }
        this.ready = true;
        this.send();
      }
    }
  }
}