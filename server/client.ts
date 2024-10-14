import type { Packet } from "./packet.ts";
import type { Sockpuppet } from "./Sockpuppet.ts";

export class Client {
  public readonly id: string;
  private parent: Sockpuppet;
  private socket: WebSocket;
  public handshakeVersion?: string;

  constructor(id: string, socket: WebSocket, parent: Sockpuppet) {
    this.id = id;
    this.parent = parent;
    this.socket = socket;

    this.socket.addEventListener("close", () => {
      this.parent.deleteClient(this.socket);
    });
  }

  public sendMessage(packet: Packet) {
    try {
      this.socket.send(packet.serialize());
    } catch (_e) {
      this.parent.deleteClient(this.socket);
    }
  }
}