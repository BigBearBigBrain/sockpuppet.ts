import type { Packet } from "./packet.ts";
import type { Sockpuppet } from "./Sockpuppet.ts";

export class Client {
  public readonly id: string;
  private parent: Sockpuppet;
  private socket: WebSocket | null;
  public handshakeVersion?: string;

  constructor(id: string, socket: WebSocket | null, parent: Sockpuppet) {
    this.id = id;
    this.parent = parent;
    this.socket = socket;

    if (this.socket) 
      this.socket.addEventListener("close", () => {
        this.parent.__deleteClient(this.socket as WebSocket);
      });
  }

  public sendMessage(packet: Packet) {
    if (!this.socket) return;
    try {
      this.socket.send(packet.serialize());
    } catch (_e) {
      this.parent.__deleteClient(this.socket);
    }
  }
}