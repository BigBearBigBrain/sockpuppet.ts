import type { TypedEventTarget, SockpuppetEventMap, ClientPacket } from "../globals.ts";
import type { Sockpuppet } from "./Sockpuppet.ts";

const EVT = (EventTarget as TypedEventTarget<SockpuppetEventMap>);

export class Channel
  extends EVT {
  constructor(
    public readonly id: string,
    private parent: Sockpuppet,
  ) {
    super();
    this.parent = parent;
  }

  public receiveMessage(packet: ClientPacket) {
    this.dispatchEvent(
      new CustomEvent("message", {
        detail: packet,
      }),
    );
    if (packet.message !== "message") {
      this.dispatchEvent(
        new CustomEvent<ClientPacket>(packet.event, {
          detail: packet,
        }),
      );
    }
  }

  public sendMessage(packet: ClientPacket) {
    packet.to = this.id;
    this.dispatchEvent(
      new CustomEvent("message", {
        detail: packet,
      }),
    );
    if (packet.message !== "message") {
      this.dispatchEvent(
        new CustomEvent<ClientPacket>(packet.event, {
          detail: packet,
        }),
      );
    }

    this.parent.sendMessage(packet);
  }

  public delete() {
    this.dispatchEvent(new CustomEvent("delete"));
  }
}
