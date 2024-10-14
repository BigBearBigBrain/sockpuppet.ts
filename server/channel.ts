import type { Client } from "./client.ts";
import type { Packet } from "./packet.ts";
import type { Sockpuppet } from "./Sockpuppet.ts";

export class Channel extends EventTarget implements IChannel<Packet> {
  private clients: Set<Client> = new Set();

  constructor(
    public readonly id: string,
    private parent: Sockpuppet,
  ) {
    super();
  }

  public addClient(client: Client) {
    this.clients.add(client);
  }

  public removeClient(client?: Client) {
    if (!client) return;
    this.clients.delete(client);
  }

  public sendMessage(packet: Packet) {
    this.dispatchEvent(
      new CustomEvent("message", {
        detail: packet,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<Packet>(packet.event, {
        detail: packet,
      }),
    );
    this.clients.forEach((c) => {
      if (c !== packet.from) {
        c.sendMessage(packet);
      }
    });
  }

  public delete() {
    dispatchEvent(new CustomEvent("delete"));
  }
}
