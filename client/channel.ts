import type { Sockpuppet } from "./Sockpuppet.ts";

export class Channel extends EventTarget implements IChannel<ClientPacket>{
  constructor(
    public readonly id: string,
    private parent: Sockpuppet
  ) {
    super();
    this.parent = parent;
  }

  public receiveMessage(packet: ClientPacket) {
    this.dispatchEvent(new CustomEvent("message", {
      detail: packet
    }));
    this.dispatchEvent(new CustomEvent<ClientPacket>(packet.event, {
      detail: packet
    }));
  }

  public sendMessage(packet: ClientPacket) {
    this.dispatchEvent(new CustomEvent("message", {
      detail: packet
    }));
    this.dispatchEvent(new CustomEvent<ClientPacket>(packet.event, {
      detail: packet
    }));

    this.parent.sendMessage(packet);
  }

  public delete() {
    this.dispatchEvent(new CustomEvent("delete"))
  }
}