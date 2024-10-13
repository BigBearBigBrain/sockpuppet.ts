import type { Client } from "./client.ts";
import type { Packet } from "./packet.ts";
import type { Sockpuppet } from "./Sockpuppet.ts";

export class Channel {
  private _id: string;
  private parent: Sockpuppet;
  private clients: Set<Client> = new Set();

  constructor(id: string,parent: Sockpuppet) {
    this._id = id;
    this.parent = parent;
  }
  
  public addClient(client: Client) {
    this.clients.add(client);
  }

  public removeClient(client?: Client) {
    if (!client) return;
    this.clients.delete(client);
  }

  public sendMessage(packet: Packet) {
    this.clients.forEach((c) => {
      if (c !== packet.from) {
        c.sendMessage(packet);
      }
    });
  }
}